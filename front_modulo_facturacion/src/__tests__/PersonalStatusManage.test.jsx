import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PersonalStatusManage from '../components/PersonalStatusManage'
import { personalService } from '../services/personalService'

// Mock the service
vi.mock('../services/personalService', () => ({
  personalService: {
    obtenerTodos: vi.fn(),
    actualizar: vi.fn()
  }
}))

describe('PersonalStatusManage', () => {
  it('renders the list of personal after loading', async () => {
    const mockPersonal = [
      {
        id: 1,
        nombre: 'JUAN',
        apellido1: 'PEREZ',
        rut: '12345678-K',
        cargo: 'Mecánico',
        base: 'Casa Matriz',
        estado: true,
        motivo: null
      },
      {
        id: 2,
        nombre: 'PEDRO',
        apellido1: 'GARCIA',
        rut: '87654321-0',
        cargo: 'Mecánico',
        base: 'Antofagasta',
        estado: false,
        motivo: 'Licencia'
      }
    ]
    
    personalService.obtenerTodos.mockResolvedValue(mockPersonal)

    render(<PersonalStatusManage />)
    
    // Should show loading initially
    expect(screen.getByText(/Cargando/)).toBeDefined()

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText(/JUAN PEREZ/)).toBeDefined()
      expect(screen.getByText(/PEDRO GARCIA/)).toBeDefined()
    })

    expect(screen.getByText('OPERATIVO')).toBeDefined()
    expect(screen.getByText('BLOQUEADO')).toBeDefined()
    expect(screen.getByText(/Licencia/)).toBeDefined()
  })
})
