import pytest
import httpx
from httpx import AsyncClient
from main import app as quart_app

@pytest.mark.asyncio
async def test_get_preventive_status_integration():
    # We use the app instance to create a test client
    # Since we need the session to be injected, we rely on the app.before_request
    async with AsyncClient(transport=httpx.ASGITransport(app=quart_app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/preventive/status-preventivo")
        
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        item = data[0]
        assert "patente" in item
        assert "odometro_actual" in item

@pytest.mark.asyncio
async def test_get_mantenciones_list():
    async with AsyncClient(transport=httpx.ASGITransport(app=quart_app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/mantenciones/")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
