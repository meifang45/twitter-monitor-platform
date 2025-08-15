import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import TwitterService from '@/services/twitterService'
import { mockMonitoredAccounts } from '@/services/mockTwitterService'
import { 
  GetAccountsResponse, 
  AddAccountRequest, 
  AddAccountResponse, 
  ApiErrorResponse,
  MonitoredAccount 
} from '@/types/twitter'

// In-memory storage for demo purposes
// In production, this would be a database
const monitoredAccounts: MonitoredAccount[] = [...mockMonitoredAccounts]

export async function GET(): Promise<NextResponse<GetAccountsResponse | ApiErrorResponse>> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Filter accounts by user (in production, this would be a database query)
    const userAccounts = monitoredAccounts.filter(
      account => account.user_id === session.user?.id || !account.user_id
    )

    return NextResponse.json({
      accounts: userAccounts,
      success: true
    })

  } catch (error) {
    console.error('Error fetching accounts:', error)
    
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

export async function POST(request: NextRequest): Promise<NextResponse<AddAccountResponse | ApiErrorResponse>> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const body: AddAccountRequest = await request.json()
    
    // Validate request body
    if (!body.username || typeof body.username !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username is required', code: 'INVALID_USERNAME' },
        { status: 400 }
      )
    }

    const username = body.username.toLowerCase().replace('@', '')

    // Check if account already exists
    const existingAccount = monitoredAccounts.find(
      account => account.username.toLowerCase() === username && 
                 account.user_id === session.user?.id
    )

    if (existingAccount) {
      return NextResponse.json(
        { success: false, error: 'Account already being monitored', code: 'ACCOUNT_EXISTS' },
        { status: 409 }
      )
    }

    // Verify the Twitter account exists
    const twitterService = TwitterService.getInstance()
    const twitterUser = await twitterService.getUserByUsername(username)

    if (!twitterUser) {
      return NextResponse.json(
        { success: false, error: `Twitter user @${username} not found`, code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Create new monitored account
    const newAccount: MonitoredAccount = {
      id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: twitterUser.username,
      name: twitterUser.name,
      profile_image_url: twitterUser.profile_image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      user_id: session.user?.id
    }

    // Add to storage (in production, this would be a database insert)
    monitoredAccounts.push(newAccount)

    return NextResponse.json({
      account: newAccount,
      success: true,
      message: `Successfully added @${username} to monitoring`
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding account:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Twitter user not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
          { status: 429 }
        )
      }
    }

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