import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingFlow } from '@/components/profile/OnboardingFlow'

export const metadata = {
    title: 'Setup Your Intelligence Profile | JobSpyde',
}

export default async function ProfileSetupPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch existing profile to hydrate partial progress
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch existing skills
    const { data: skillsData } = await supabase
        .from('profile_skills')
        .select('skill_name')
        .eq('user_id', user.id)

    const initialSkills = skillsData?.map(s => s.skill_name) || []

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4 relative z-10 w-full">
            <OnboardingFlow 
                initialProfile={profile} 
                initialSkills={initialSkills}
            />
        </div>
    )
}
