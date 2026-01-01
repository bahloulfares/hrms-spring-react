# 🧪 Guide des Tests - HRMS

## Vue d'ensemble

Ce projet utilise:
- **JUnit 5** : Framework de test
- **Mockito** : Mocking et vérification
- **AssertJ** : Assertions fluides
- **Spring Test** : Context Spring pour les tests d'intégration

---

## 🚀 Exécution des Tests

### Tous les tests
```bash
cd GestionRH
mvn test
```

### Tests d'une classe spécifique
```bash
mvn test -Dtest=UtilisateurServiceTest
```

### Tests d'une méthode spécifique
```bash
mvn test -Dtest=UtilisateurServiceTest#testCreerUtilisateurSuccess
```

### Tests avec coverage (couverture de code)
```bash
mvn test jacoco:report
# Rapport: target/site/jacoco/index.html
```

---

## 📁 Structure des Tests

### Répertoires
```
GestionRH/src/test/
├── java/com/fares/gestionrh/
│   ├── service/
│   │   ├── UtilisateurServiceTest.java
│   │   ├── CongeServiceTest.java
│   │   └── ...
│   ├── controller/
│   │   └── EmployeControllerTest.java
│   └── repository/
│       └── UtilisateurRepositoryTest.java
└── resources/
    └── application-test.properties
```

### Conventions de nommage
- Test de service: `{ServiceName}Test`
- Test de contrôleur: `{ControllerName}Test`
- Méthode de test: `test{MethodName}{Scenario}`

Exemple:
```java
@Test
void testCreerUtilisateurSuccess() { }
@Test
void testCreerUtilisateurEmailExists() { }
```

---

## 📝 Écrire un Test Unitaire

### Structure AAA (Arrange-Act-Assert)

```java
@Test
@DisplayName("Description claire du test")
void testNomDeLaMethode() {
    // ARRANGE - Préparer les données et les mocks
    Utilisateur utilisateur = Utilisateur.builder()
        .email("test@example.com")
        .build();
    
    when(utilisateurRepository.findById(1L))
        .thenReturn(Optional.of(utilisateur));

    // ACT - Exécuter la méthode à tester
    UtilisateurDTO result = utilisateurService.getUtilisateurById(1L);

    // ASSERT - Vérifier les résultats
    assertNotNull(result);
    assertEquals("test@example.com", result.getEmail());
    verify(utilisateurRepository, times(1)).findById(1L);
}
```

---

## 🎯 Exemples de Tests

### 1. Test de Service (Mock Repository)

```java
@ExtendWith(MockitoExtension.class)
class UtilisateurServiceTest {

    @Mock
    private UtilisateurRepository repository;

    @InjectMocks
    private UtilisateurService service;

    @Test
    void testGetById() {
        // Arrange
        Utilisateur user = new Utilisateur();
        user.setId(1L);
        user.setEmail("test@test.com");
        
        when(repository.findById(1L))
            .thenReturn(Optional.of(user));

        // Act
        UtilisateurDTO result = service.getUtilisateurById(1L);

        // Assert
        assertNotNull(result);
        verify(repository).findById(1L);
    }
}
```

### 2. Test d'Exception

```java
@Test
void testGetByIdNotFound() {
    // Arrange
    when(repository.findById(999L))
        .thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(ResourceNotFoundException.class, () -> {
        service.getUtilisateurById(999L);
    });

    verify(repository).findById(999L);
}
```

### 3. Test avec Pagination

```java
@Test
void testGetAllPaginated() {
    // Arrange
    Pageable pageable = PageRequest.of(0, 10);
    Page<Utilisateur> page = new PageImpl<>(
        Collections.singletonList(user),
        pageable,
        1
    );
    
    when(repository.findAll(pageable))
        .thenReturn(page);

    // Act
    Page<UtilisateurDTO> result = service.getAllUtilisateurs(pageable);

    // Assert
    assertEquals(1, result.getTotalElements());
}
```

---

## 🔍 Assertions Utiles

### JUnit 5

```java
// Assertions de base
assertEquals(expected, actual);
assertNotNull(result);
assertTrue(condition);
assertFalse(condition);
assertThrows(Exception.class, () -> { /* code */ });
```

### Mockito - Vérifications

```java
// Vérifier qu'une méthode a été appelée
verify(mock).method();

// Vérifier le nombre d'appels
verify(mock, times(1)).method();
verify(mock, never()).method();
verify(mock, atLeast(2)).method();
verify(mock, atMostOnce()).method();

// Vérifier l'ordre des appels
InOrder inOrder = inOrder(mock1, mock2);
inOrder.verify(mock1).method1();
inOrder.verify(mock2).method2();
```

---

## 📊 Couverture de Code

### Générer un rapport de couverture

```bash
# Avec JaCoCo
mvn test jacoco:report

# Ouvrir le rapport
open target/site/jacoco/index.html
```

### Objectifs de couverture

- **Idéal** : > 80% couverture
- **Bon** : 70-80%
- **Acceptable** : 60-70%

**Focus sur** :
- Tous les services (100%)
- Tous les contrôleurs (80%+)
- Exceptions et cas limites

---

## 🛠️ Bonnes Pratiques

### ✅ À FAIRE

1. **Tester une seule chose par test**
   ```java
   @Test
   void testCreerUtilisateurSuccess() { }  // ✅ Une responsabilité
   
   // ❌ Mauvais:
   @Test
   void testCreerEtModifierUtilisateur() { }  // Teste deux choses
   ```

2. **Utiliser des noms descriptifs**
   ```java
   @DisplayName("Créer un utilisateur avec succès")  // ✅ Clair
   void testSuccess() { }  // ❌ Pas assez descriptif
   ```

3. **Tester les cas limites**
   ```java
   @Test
   void testCreerUtilisateurEmailVide() { }
   @Test
   void testCreerUtilisateurMotDePasseNull() { }
   ```

4. **Isoler les tests avec des mocks**
   ```java
   @Mock UtilisateurRepository repository;  // ✅ Mock le repository
   // Ne PAS faire une vraie requête BD
   ```

5. **Nettoyer après les tests**
   ```java
   @AfterEach
   void tearDown() {
       // Nettoyer les données de test
   }
   ```

### ❌ À ÉVITER

1. **Tests dépendants les uns des autres**
   ```java
   // ❌ Mauvais - test2 dépend de test1
   void test1() { }
   void test2() { depends on test1 }
   ```

2. **Tests qui accèdent vraiment à la BD**
   ```java
   // ❌ Mauvais - utilise vraiment la BD
   when(repository.save()).thenCallRealMethod();
   
   // ✅ Bon
   when(repository.save(any())).thenReturn(user);
   ```

3. **Assertions flous**
   ```java
   // ❌ Trop vague
   assertNotNull(result);
   
   // ✅ Spécifique
   assertEquals("Jean", result.getPrenom());
   assertEquals("dupont@test.com", result.getEmail());
   ```

---

## 🚀 Próximos Passos

### 1. Ajouter des tests pour les contrôleurs

```java
@WebMvcTest(EmployeController.class)
class EmployeControllerTest {

    @MockBean
    private UtilisateurService service;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetAllEmployes() throws Exception {
        mockMvc.perform(get("/api/employes"))
            .andExpect(status().isOk());
    }
}
```

### 2. Tests d'intégration

```java
@SpringBootTest
@AutoConfigureMockMvc
class IntegrationTest {
    // Tests avec context Spring complet
}
```

### 3. Tests de Repository

```java
@DataJpaTest
class UtilisateurRepositoryTest {
    @Autowired
    private UtilisateurRepository repository;
    
    @Autowired
    private TestEntityManager em;
}
```

---

## 📞 Ressources

- [JUnit 5 Docs](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Docs](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Spring Test Docs](https://spring.io/guides/gs/testing-web/)

---

**Dernière mise à jour:** 28/12/2024
