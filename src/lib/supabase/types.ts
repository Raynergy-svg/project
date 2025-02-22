export type Json =
     | string
     | number
     | boolean
     | null
     | { [key: string]: Json | undefined }
     | Json[]
   
   export interface Database {
     public: {
       Tables: {
         users: {
           Row: {
             id: string
             email: string
             created_at: string
           }
           Insert: {
             id?: string
             email: string
             created_at?: string
           }
           Update: {
             id?: string
             email?: string
             created_at?: string
           }
         }
         financial_profiles: {
           Row: {
             id: string
             user_id: string
             monthly_income: number
             created_at: string
           }
           Insert: {
             id?: string
             user_id: string
             monthly_income: number
             created_at?: string
           }
           Update: {
             id?: string
             user_id?: string
             monthly_income?: number
             created_at?: string
           }
         }
         debts: {
           Row: {
             id: string
             user_id: string
             type: string
             amount: number
             interest_rate: number
             minimum_payment: number
             created_at: string
           }
           Insert: {
             id?: string
             user_id: string
             type: string
             amount: number
             interest_rate: number
             minimum_payment: number
             created_at?: string
           }
           Update: {
             id?: string
             user_id?: string
             type?: string
             amount?: number
             interest_rate?: number
             minimum_payment?: number
             created_at?: string
           }
         }
         savings_goals: {
           Row: {
             id: string
             user_id: string
             name: string
             target_amount: number
             current_amount: number
             deadline: string | null
             created_at: string
           }
           Insert: {
             id?: string
             user_id: string
             name: string
             target_amount: number
             current_amount: number
             deadline?: string | null
             created_at?: string
           }
           Update: {
             id?: string
             user_id?: string
             name?: string
             target_amount?: number
             current_amount?: number
             deadline?: string | null
             created_at?: string
           }
         }
       }
     }
   }