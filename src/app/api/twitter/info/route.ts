import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import TwitterService from '@/services/twitterService'

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const twitterService = TwitterService.getInstance()
    const serviceInfo = twitterService.getServiceInfo()

    return NextResponse.json({
      success: true,
      service: serviceInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting service info:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: 500 }
    )
  }
}