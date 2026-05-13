package com.spe.healthcare.service;

import com.spe.healthcare.dto.OrderRequest;
import com.spe.healthcare.model.Medicine;
import com.spe.healthcare.model.Order;
import com.spe.healthcare.model.User;
import com.spe.healthcare.repository.OrderRepository;
import com.spe.healthcare.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MedicineService medicineService;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository,
            MedicineService medicineService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.medicineService = medicineService;
    }

    @Transactional
    public Order placeOrder(String username, OrderRequest orderRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Medicine medicine = medicineService.getMedicineById(orderRequest.getMedicineId());

        if (medicine.getStock() < orderRequest.getQuantity()) {
            throw new RuntimeException("Insufficient stock for medicine: " + medicine.getName());
        }

        // Reduce stock
        medicine.setStock(medicine.getStock() - orderRequest.getQuantity());

        Order order = Order.builder()
                .user(user)
                .medicine(medicine)
                .quantity(orderRequest.getQuantity())
                .totalPrice(medicine.getPrice() * orderRequest.getQuantity())
                .status(Order.OrderStatus.PENDING)
                .build();

        Order savedOrder = orderRepository.save(order);
        logger.info("Order placed by {}: Medicine={}, Qty={}, Total={}",
                username, medicine.getName(), orderRequest.getQuantity(), order.getTotalPrice());
        return savedOrder;
    }

    public List<Order> getUserOrders(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByOrderDateDesc(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        try {
            Order.OrderStatus oldStatus = order.getStatus();
            Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());

            if (oldStatus != newStatus) {
                Medicine medicine = order.getMedicine();

                // If changing to CANCELLED, restore stock
                if (newStatus == Order.OrderStatus.CANCELLED) {
                    medicine.setStock(medicine.getStock() + order.getQuantity());
                    medicineService.updateMedicine(medicine.getId(), medicine);
                }
                // If changing from CANCELLED back to active, deduct stock
                else if (oldStatus == Order.OrderStatus.CANCELLED) {
                    if (medicine.getStock() < order.getQuantity()) {
                        throw new RuntimeException("Insufficient stock to un-cancel order");
                    }
                    medicine.setStock(medicine.getStock() - order.getQuantity());
                    medicineService.updateMedicine(medicine.getId(), medicine);
                }

                order.setStatus(newStatus);
            }

            Order updated = orderRepository.save(order);
            logger.info("Order #{} status updated to {}", orderId, newStatus);
            return updated;
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    @Transactional
    public Order cancelOrder(String username, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You do not have permission to cancel this order");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        Medicine medicine = order.getMedicine();
        medicine.setStock(medicine.getStock() + order.getQuantity());
        medicineService.updateMedicine(medicine.getId(), medicine);

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        
        logger.info("Order #{} cancelled by user {}", orderId, username);
        return updated;
    }
}
