import { z } from 'zod';
import { cookies } from 'next/headers';
import { createClient, createAdminClient } from '../config/database';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  subscription_id: z.string().optional(),
  subscription_status: z.enum(['active', 'inactive', 'trial']).default('inactive'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const UserService = {
  async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        ...data,
        subscription_status: data.subscription_id ? 'active' : 'trial',
      }])
      .select()
      .single();

    if (error) throw error;
    return user;
  },

  async findByEmail(email: string) {
    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return user;
  },

  async updateSubscription(userId: string, subscriptionId: string, status: User['subscription_status']) {
    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .update({
        subscription_id: subscriptionId,
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return user;
  },

  async getCurrentUser() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  },
}; 