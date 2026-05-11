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
}
