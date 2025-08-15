import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ApiErrorResponse } from '@/types/twitter'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message?: string } | ApiErrorResponse>> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required', code: 'INVALID_ID' },
        { status: 400 }
      )
    }

    // In a real application, this would be a database operation
    // For demo purposes, we'll just return success
    // const deleted = await deleteMonitoredAccount(id, session.user.id)

    return NextResponse.json({
      success: true,
      message: `Account removed from monitoring`
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message?: string } | ApiErrorResponse>> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required', code: 'INVALID_ID' },
        { status: 400 }
      )
    }

    // Validate update fields
    const allowedFields = ['is_active']
    const updates = Object.keys(body).filter(key => allowedFields.includes(key))
    
    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update', code: 'INVALID_UPDATE' },
        { status: 400 }
      )
    }

    // In a real application, this would update the database
    // For demo purposes, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: `Account updated successfully`
    })

  } catch (error) {
    console.error('Error updating account:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}