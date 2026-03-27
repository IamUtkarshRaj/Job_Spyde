'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('profiles')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) throw error
    revalidatePath('/profile')
    return true
}

export async function upsertExperiences(experiences: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Upsert experiences
    const { error } = await supabase
        .from('profile_experiences')
        .upsert(
            experiences.map(exp => ({ ...exp, user_id: user.id })),
            { onConflict: 'id' }
        )

    if (error) throw error
    revalidatePath('/profile')
    return true
}

export async function upsertEducation(entries: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('profile_education_entries')
        .upsert(
            entries.map(edu => ({ ...edu, user_id: user.id })),
            { onConflict: 'id' }
        )

    if (error) throw error
    revalidatePath('/profile')
    return true
}

export async function upsertSkills(skills: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Delete existing skills first
    await supabase.from('profile_skills').delete().eq('user_id', user.id)

    if (skills.length > 0) {
        const { error } = await supabase
            .from('profile_skills')
            .insert(skills.map(skill => ({ user_id: user.id, skill_name: skill })))
        
        if (error) throw error
    }

    revalidatePath('/profile')
    return true
}

export async function completeOnboarding(completionScore: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('profiles')
        .update({
            onboarding_completed: true,
            profile_completion: completionScore,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) throw error

    // Update user metadata to cache completion status for edge middleware
    await supabase.auth.updateUser({
        data: { onboarding_completed: true }
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    revalidatePath('/profile/setup')
    return true
}
