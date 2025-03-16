import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Stripe } from 'stripe';
import type { Database } from '@/types/supabase.types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access invoices' },
        { status: 401 }
      );
    }
    
    // Get user's stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData?.stripe_customer_id) {
      return NextResponse.json(
        { invoices: [] }, // Return empty invoices if user has no Stripe customer ID
        { status: 200 }
      );
    }
    
    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: userData.stripe_customer_id,
      limit: 24, // Last 2 years of monthly invoices
    });
    
    // Format invoices for the frontend
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: invoice.amount_paid,
      status: invoice.status,
      url: invoice.invoice_pdf,
    }));
    
    return NextResponse.json({ invoices: formattedInvoices }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
} 