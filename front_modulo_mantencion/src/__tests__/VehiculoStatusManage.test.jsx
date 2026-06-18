import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import VehiculoStatusManage from '../components/VehiculoStatusManage'
import { vehiculoService } from '../services/vehiculoService'

// Mock the service
vi.mock('../services/vehiculoService', () => ({
  vehiculoService: {
    obtenerTodos: vi.fn()
  }
}))

describe('VehiculoStatusManage', () => {
  it('renders the list of vehicles after loading', async () => {
    const mockVehiculos = [
      {
        id: 1,
        patente: 'ABCD-12',
        modelo: 'Camion 1',
        estado: 'Disponible',
        numero_interno: '101',
        device_id: 123,
        notas: 'Todo ok'
      },
      {
        id: 2,
        patente: 'XYZ-99',
        modelo: 'Camion 2',
        estado: 'BLOQUEADO',
        numero_interno: '202',
        device_id: 456,
        notas: 'En reparacion'
      }
    ]
    
    vehiculoService.obtenerTodos.mockResolvedValue(mockVehiculos)

    render(<VehiculoStatusManage />)
    
    // Should show loading initially
    expect(screen.getByText(/Cargando/)).toBeDefined()

    // Wait for the data to be rendered
    await waitFor(() => {
      expect(screen.getByText('ABCD-12')).toBeDefined()
      expect(screen.getByText('XYZ-99')).toBeDefined()
    })

    expect(screen.getByText('Disponible')).toBeDefined()
    expect(screen.getByText('BLOQUEADO')).toBeDefined()
    expect(screen.getByText('Todo ok')).toBeDefined()
  })

  it('renders "Sin notas." when no notes are provided', async () => {
    const mockVehiculos = [
      {
        id: 3,
        patente: 'TEST-00',
        modelo: 'Test Model',
        estado: 'Disponible',
        notas: ''
      }
    ]
    
    vehiculoService.obtenerTodos.mockResolvedValue(mockVehiculos)

    render(<VehiculoStatusManage />)
    
    await waitFor(() => {
      expect(screen.getByText('TEST-00')).toBeDefined()
      expect(screen.getByText('Sin notas.')).toBeDefined()
    })
  })
})
