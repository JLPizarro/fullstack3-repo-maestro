import pytest
from unittest.mock import AsyncMock, MagicMock
from src.service.mantencion_service import MantencionService
from src.models.mantencion import MantencionCreate, MantencionUpdate, MantencionResponse
from src.models.vehiculo import VehiculoUpdate

@pytest.fixture
def mock_mantencion_repo():
    return AsyncMock()

@pytest.fixture
def mock_vehiculo_repo():
    return AsyncMock()

@pytest.fixture
def service(mock_mantencion_repo, mock_vehiculo_repo):
    return MantencionService(mock_mantencion_repo, mock_vehiculo_repo)

@pytest.mark.asyncio
async def test_create_mantencion_blocks_vehicle(service, mock_mantencion_repo, mock_vehiculo_repo):
    # Arrange
    data = MantencionCreate(
        vehiculo_id=1,
        mecanico_id=1,
        tipo="Preventiva",
        tareas="Test tasks"
    )
    mock_mantencion_repo.create.return_value = MagicMock(id=1, **data.model_dump())
    mock_vehiculo_repo.get_by_id.return_value = MagicMock(id=1)

    # Act
    await service.create_mantencion(data)

    # Assert
    mock_vehiculo_repo.update.assert_called_once()
    args, kwargs = mock_vehiculo_repo.update.call_args
    update_data = args[1]
    assert update_data.estado == "BLOQUEADO POR MANTENCIÓN Preventiva"

@pytest.mark.asyncio
async def test_update_mantencion_to_completada_unblocks_vehicle(service, mock_mantencion_repo, mock_vehiculo_repo):
    # Arrange
    mantencion_id = 1
    update_data = MantencionUpdate(estado="Completada")
    
    # Use a real object-like mock or just a class to avoid MagicMock field issues
    class MockDBObj:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
    
    mock_db_obj = MockDBObj(id=mantencion_id, vehiculo_id=10, estado="En_curso", tipo="Preventiva", tareas="Tasks")
    mock_mantencion_repo.get_by_id.return_value = mock_db_obj
    
    updated_db_obj = MockDBObj(
        id=mantencion_id, 
        vehiculo_id=10, 
        mecanico_id=5,
        estado="Completada", 
        tipo="Preventiva", 
        tareas="Tasks",
        fecha=None,
        fecha_ingreso=None,
        fecha_salida=None,
        fecha_programada=None
    )
    mock_mantencion_repo.update.return_value = updated_db_obj
    
    mock_vehiculo_repo.get_by_id.return_value = MockDBObj(id=10, estado="Ocupado")

    # Act
    await service.update_mantencion(mantencion_id, update_data)

    # Assert
    # First update call is for the maintenance itself, second (if logic works) is for vehicle unblocking
    # In my implementation, I call vehiculo_repo.update with VehiculoUpdate(estado="Disponible")
    mock_vehiculo_repo.update.assert_called_once()
    args, _ = mock_vehiculo_repo.update.call_args
    v_update_data = args[1]
    assert v_update_data.estado == "Disponible"

@pytest.mark.asyncio
async def test_delete_mantencion_unblocks_vehicle(service, mock_mantencion_repo, mock_vehiculo_repo):
    # Arrange
    mantencion_id = 1
    mock_db_obj = MagicMock(id=mantencion_id, vehiculo_id=20)
    mock_mantencion_repo.get_by_id.return_value = mock_db_obj
    mock_vehiculo_repo.get_by_id.return_value = MagicMock(id=20)

    # Act
    await service.delete_mantencion(mantencion_id)

    # Assert
    mock_mantencion_repo.delete.assert_called_once_with(mock_db_obj)
    mock_vehiculo_repo.update.assert_called_once()
    args, _ = mock_vehiculo_repo.update.call_args
    v_update_data = args[1]
    assert v_update_data.estado == "Disponible"
