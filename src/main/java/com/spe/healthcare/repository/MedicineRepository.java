package com.spe.healthcare.repository;

import com.spe.healthcare.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByCategory(String category);

    List<Medicine> findByNameContainingIgnoreCase(String name);
}
