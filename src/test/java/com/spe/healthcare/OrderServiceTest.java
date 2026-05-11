package com.spe.healthcare;

import com.spe.healthcare.dto.OrderRequest;
import com.spe.healthcare.model.Medicine;
import com.spe.healthcare.model.Order;
import com.spe.healthcare.model.User;
import com.spe.healthcare.repository.OrderRepository;
import com.spe.healthcare.repository.UserRepository;
import com.spe.healthcare.service.MedicineService;
import com.spe.healthcare.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MedicineService medicineService;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private Medicine medicine;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("testuser").role(User.Role.USER).build();
        medicine = Medicine.builder().id(1L).name("Paracetamol").price(5.99).stock(100).build();
    }

    @Test
    void placeOrder_Success() {
        OrderRequest request = new OrderRequest();
        request.setMedicineId(1L);
        request.setQuantity(2);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(medicineService.getMedicineById(1L)).thenReturn(medicine);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });

        Order result = orderService.placeOrder("testuser", request);

        assertNotNull(result);
        assertEquals(2, result.getQuantity());
        assertEquals(11.98, result.getTotalPrice());
        assertEquals(98, medicine.getStock()); // stock reduced
    }

    @Test
    void placeOrder_InsufficientStock_ShouldThrow() {
        OrderRequest request = new OrderRequest();
        request.setMedicineId(1L);
        request.setQuantity(200);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(medicineService.getMedicineById(1L)).thenReturn(medicine);

        assertThrows(RuntimeException.class, () -> orderService.placeOrder("testuser", request));
    }

    @Test
    void getUserOrders_ShouldReturnList() {
        Order order = Order.builder().id(1L).user(user).medicine(medicine).quantity(1).build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(orderRepository.findByUserOrderByOrderDateDesc(user)).thenReturn(Arrays.asList(order));

        List<Order> result = orderService.getUserOrders("testuser");
        assertEquals(1, result.size());
    }

    @Test
    void getAllOrders_ShouldReturnAll() {
        when(orderRepository.findAllByOrderByOrderDateDesc()).thenReturn(Arrays.asList());
        List<Order> result = orderService.getAllOrders();
        assertNotNull(result);
    }
}
