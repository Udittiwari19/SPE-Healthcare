package com.spe.healthcare;

import com.spe.healthcare.model.Medicine;
import com.spe.healthcare.repository.MedicineRepository;
import com.spe.healthcare.service.MedicineService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private MedicineService medicineService;

    private Medicine medicine;

    @BeforeEach
    void setUp() {
        medicine = Medicine.builder()
                .id(1L)
                .name("Paracetamol")
                .description("Pain reliever")
                .price(5.99)
                .stock(100)
                .category("Pain Relief")
                .manufacturer("PharmaCo")
                .build();
    }

    @Test
    void getAllMedicines_ShouldReturnList() {
        when(medicineRepository.findAll()).thenReturn(Arrays.asList(medicine));
        List<Medicine> result = medicineService.getAllMedicines();
        assertEquals(1, result.size());
        assertEquals("Paracetamol", result.get(0).getName());
    }

    @Test
    void getMedicineById_WhenExists_ShouldReturn() {
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        Medicine result = medicineService.getMedicineById(1L);
        assertEquals("Paracetamol", result.getName());
    }

    @Test
    void getMedicineById_WhenNotExists_ShouldThrow() {
        when(medicineRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> medicineService.getMedicineById(99L));
    }

    @Test
    void addMedicine_ShouldSaveAndReturn() {
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);
        Medicine result = medicineService.addMedicine(medicine);
        assertNotNull(result);
        assertEquals("Paracetamol", result.getName());
        verify(medicineRepository, times(1)).save(any(Medicine.class));
    }

    @Test
    void updateMedicine_ShouldUpdateFields() {
        Medicine updated = Medicine.builder()
                .name("Updated Paracetamol")
                .description("Updated description")
                .price(7.99)
                .stock(200)
                .category("Pain Relief")
                .manufacturer("NewPharmaCo")
                .build();

        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(updated);

        Medicine result = medicineService.updateMedicine(1L, updated);
        assertEquals("Updated Paracetamol", result.getName());
        assertEquals(7.99, result.getPrice());
    }

    @Test
    void deleteMedicine_WhenExists_ShouldDelete() {
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        doNothing().when(medicineRepository).delete(medicine);
        assertDoesNotThrow(() -> medicineService.deleteMedicine(1L));
        verify(medicineRepository, times(1)).delete(medicine);
    }

    @Test
    void searchMedicines_ShouldReturnMatches() {
        when(medicineRepository.findByNameContainingIgnoreCase("para"))
                .thenReturn(Arrays.asList(medicine));
        List<Medicine> result = medicineService.searchMedicines("para");
        assertEquals(1, result.size());
    }
}
