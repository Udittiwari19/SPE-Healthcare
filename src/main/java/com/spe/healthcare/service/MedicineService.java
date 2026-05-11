package com.spe.healthcare.service;

import com.spe.healthcare.model.Medicine;
import com.spe.healthcare.repository.MedicineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private static final Logger logger = LoggerFactory.getLogger(MedicineService.class);

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
    }

    public List<Medicine> searchMedicines(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name);
    }

    public Medicine addMedicine(Medicine medicine) {
        Medicine saved = medicineRepository.save(medicine);
        logger.info("Medicine added: {} (ID: {})", saved.getName(), saved.getId());
        return saved;
    }

    public Medicine updateMedicine(Long id, Medicine medicineDetails) {
        Medicine medicine = getMedicineById(id);
        medicine.setName(medicineDetails.getName());
        medicine.setDescription(medicineDetails.getDescription());
        medicine.setPrice(medicineDetails.getPrice());
        medicine.setStock(medicineDetails.getStock());
        medicine.setCategory(medicineDetails.getCategory());
        medicine.setManufacturer(medicineDetails.getManufacturer());
        Medicine updated = medicineRepository.save(medicine);
        logger.info("Medicine updated: {} (ID: {})", updated.getName(), updated.getId());
        return updated;
    }

    public void deleteMedicine(Long id) {
        Medicine medicine = getMedicineById(id);
        medicineRepository.delete(medicine);
        logger.info("Medicine deleted: {} (ID: {})", medicine.getName(), id);
    }
}
