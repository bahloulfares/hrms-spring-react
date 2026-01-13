# Script PowerShell pour réparer l'historique Flyway
# Exécute la requête SQL pour supprimer l'entrée de migration échouée

$server = "localhost"
$database = "gestionrh"
$username = "gestionrh_app"
$password = "Re88o830u3*"

Write-Host "Connexion à MySQL et réparation de l'historique Flyway..." -ForegroundColor Yellow

# Créer la connexion avec le connecteur MySQL .NET
try {
    # Charger l'assembly MySQL si disponible
    Add-Type -Path "C:\Program Files (x86)\MySQL\MySQL Connector NET 8.0\Assemblies\v4.5.2\MySql.Data.dll" -ErrorAction SilentlyContinue
    
    $connectionString = "Server=$server;Database=$database;Uid=$username;Pwd=$password;"
    $connection = New-Object MySql.Data.MySqlClient.MySqlConnection($connectionString)
    $connection.Open()
    
    # Supprimer les entrées de migration échouées
    $command = $connection.CreateCommand()
    $command.CommandText = "DELETE FROM flyway_schema_history WHERE success = 0"
    $rowsAffected = $command.ExecuteNonQuery()
    
    Write-Host "✓ $rowsAffected entrée(s) de migration échouée(s) supprimée(s)" -ForegroundColor Green
    
    # Afficher l'historique restant
    $command.CommandText = "SELECT version, description, type, installed_on, success FROM flyway_schema_history ORDER BY installed_rank"
    $reader = $command.ExecuteReader()
    
    Write-Host "`nHistorique Flyway actuel:" -ForegroundColor Cyan
    while ($reader.Read()) {
        $version = $reader["version"]
        $description = $reader["description"]
        $success = $reader["success"]
        $status = if ($success -eq 1) { "✓" } else { "✗" }
        Write-Host "  $status V$version - $description"
    }
    $reader.Close()
    
    $connection.Close()
    Write-Host "`n✓ Réparation terminée avec succès!" -ForegroundColor Green
    Write-Host "Vous pouvez maintenant redémarrer l'application." -ForegroundColor Yellow
    
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
    Write-Host "`nSolution alternative:" -ForegroundColor Yellow
    Write-Host "Exécutez cette requête SQL manuellement dans phpMyAdmin ou MySQL Workbench:" -ForegroundColor White
    Write-Host "  DELETE FROM gestionrh.flyway_schema_history WHERE success = 0;" -ForegroundColor Cyan
}
