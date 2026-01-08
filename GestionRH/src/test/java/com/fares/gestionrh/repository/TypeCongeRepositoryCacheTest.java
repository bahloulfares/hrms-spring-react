package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.TypeConge;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.mail.host=localhost",
        "spring.mail.port=3025"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class TypeCongeRepositoryCacheTest {

    @Autowired
    private TypeCongeRepository typeCongeRepository;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void setup() {
        clearAllCaches();
        
        // Skip deleteAll to avoid FK constraints; rely on @DirtiesContext
        // Use unique suffixes for both code and nom to avoid unique constraint violations
        long timestamp = System.nanoTime();
        TypeConge cp = TypeConge.builder()
                .code("CP-" + timestamp)
                .nom("Congé Payé " + timestamp)
                .joursParAn(25)
                .compteWeekend(false)
                .peutDeborderSurCP(false)
                .build();
        typeCongeRepository.save(cp);
        
        TypeConge rtt = TypeConge.builder()
                .code("RTT-" + timestamp)
                .nom("RTT " + timestamp)
                .joursParAn(10)
                .compteWeekend(false)
                .peutDeborderSurCP(true)
                .build();
        typeCongeRepository.save(rtt);
    }

    @Test
    @DisplayName("findByCode should cache results")
    void findByCodeUsesCache() {
        clearAllCaches();
        
        List<TypeConge> all = typeCongeRepository.findAll();
        String code1 = all.get(0).getCode();
        String code2 = all.get(1).getCode();
        
        // First call - should hit DB
        typeCongeRepository.findByCode(code1);
        assertThat(getCacheSize("typeCongeByCode")).isEqualTo(1);
        
        // Second call - should hit cache
        typeCongeRepository.findByCode(code1);
        assertThat(getCacheSize("typeCongeByCode")).isEqualTo(1);
        
        // Different code - should hit DB again
        typeCongeRepository.findByCode(code2);
        assertThat(getCacheSize("typeCongeByCode")).isEqualTo(2);
    }

    @Test
    @DisplayName("findByNom should cache results")
    void findByNomUsesCache() {
        clearAllCaches();
        
        typeCongeRepository.findByNom("Congé Payé");
        assertThat(getCacheSize("typeCongeByNom")).isEqualTo(1);
        
        typeCongeRepository.findByNom("Congé Payé");
        assertThat(getCacheSize("typeCongeByNom")).isEqualTo(1);
        
        typeCongeRepository.findByNom("RTT");
        assertThat(getCacheSize("typeCongeByNom")).isEqualTo(2);
    }

    @Test
    @DisplayName("findAll should cache results")
    void findAllUsesCache() {
        clearAllCaches();
        
        var result1 = typeCongeRepository.findAll();
        assertThat(result1).isNotEmpty();
        assertThat(getCacheSize("allTypeConges")).isEqualTo(1);
        
        var result2 = typeCongeRepository.findAll();
        assertThat(result2).hasSize(result1.size());
        assertThat(getCacheSize("allTypeConges")).isEqualTo(1);
    }

    private void clearAllCaches() {
        if (cacheManager.getCache("typeCongeByCode") != null) {
            cacheManager.getCache("typeCongeByCode").clear();
        }
        if (cacheManager.getCache("typeCongeByNom") != null) {
            cacheManager.getCache("typeCongeByNom").clear();
        }
        if (cacheManager.getCache("allTypeConges") != null) {
            cacheManager.getCache("allTypeConges").clear();
        }
    }

    private int getCacheSize(String cacheName) {
        var cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            return 0;
        }
        if (cache.getNativeCache() instanceof java.util.concurrent.ConcurrentMap) {
            return ((java.util.concurrent.ConcurrentMap<?, ?>) cache.getNativeCache()).size();
        }
        return 0;
    }
}
