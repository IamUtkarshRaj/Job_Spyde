'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// ── Register professional fonts ─────────────────────────────────────────
Font.register({
    family: 'Helvetica',
    src: undefined as any, // Built-in font
})

// ── Professional Resume PDF Styles ──────────────────────────────────────
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1a1a2e',
        lineHeight: 1.5,
    },
    // Header
    header: {
        marginBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 12,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    contactItem: {
        fontSize: 9,
        color: '#4a5568',
        marginRight: 12,
    },
    contactLink: {
        fontSize: 9,
        color: '#2563eb',
        marginRight: 12,
    },
    // Section
    sectionContainer: {
        marginTop: 14,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a1a2e',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 4,
    },
    // Summary
    summary: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.6,
    },
    // Experience / Project entry
    entryContainer: {
        marginBottom: 10,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    entryTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    entrySubtitle: {
        fontSize: 10,
        color: '#2563eb',
        fontWeight: 'bold',
    },
    entryDates: {
        fontSize: 9,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    entryDescription: {
        fontSize: 9.5,
        color: '#374151',
        lineHeight: 1.6,
        marginTop: 3,
    },
    techStack: {
        fontSize: 9,
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: 2,
    },
    // Skills
    skillsText: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.6,
    },
    // Education
    eduRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    eduDegree: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    eduSchool: {
        fontSize: 10,
        color: '#4a5568',
    },
    eduDates: {
        fontSize: 9,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    // Certifications
    certItem: {
        fontSize: 10,
        color: '#374151',
        marginBottom: 3,
    },
    certIssuer: {
        color: '#6b7280',
        fontStyle: 'italic',
    },
})

// ── Resume PDF Document Component ───────────────────────────────────────
interface ResumePDFProps {
    data: {
        optimized_profile: any
        optimized_experience: any[]
        optimized_projects: any[]
        optimized_skills: string
        education: any[]
        certifications: any[]
    }
}

export function ResumePDF({ data }: ResumePDFProps) {
    const profile = data.optimized_profile || {}
    const experience = data.optimized_experience || []
    const projects = data.optimized_projects || []
    const skills = data.optimized_skills || ''
    const education = data.education || []
    const certifications = data.certifications || []

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.name}>{profile.full_name || 'Your Name'}</Text>
                    <View style={styles.contactRow}>
                        {profile.email && <Text style={styles.contactItem}>{profile.email}</Text>}
                        {profile.phone && <Text style={styles.contactItem}>{profile.phone}</Text>}
                        {profile.location && <Text style={styles.contactItem}>{profile.location}</Text>}
                        {profile.linkedin_url && <Text style={styles.contactLink}>{profile.linkedin_url}</Text>}
                        {profile.portfolio_url && <Text style={styles.contactLink}>{profile.portfolio_url}</Text>}
                    </View>
                </View>

                {/* ── Professional Summary ── */}
                {profile.professional_summary && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.summary}>{profile.professional_summary}</Text>
                    </View>
                )}

                {/* ── Experience ── */}
                {experience.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {experience.map((exp: any, idx: number) => (
                            <View key={idx} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{exp.title}</Text>
                                    <Text style={styles.entryDates}>{exp.dates}</Text>
                                </View>
                                <Text style={styles.entrySubtitle}>{exp.company}</Text>
                                <Text style={styles.entryDescription}>{exp.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Projects ── */}
                {projects.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.map((proj: any, idx: number) => (
                            <View key={idx} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{proj.name}</Text>
                                    {proj.url && <Text style={styles.entryDates}>{proj.url}</Text>}
                                </View>
                                {proj.technologies && (
                                    <Text style={styles.techStack}>Tech: {proj.technologies}</Text>
                                )}
                                <Text style={styles.entryDescription}>{proj.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Skills ── */}
                {skills && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <Text style={styles.skillsText}>{skills}</Text>
                    </View>
                )}

                {/* ── Education ── */}
                {education.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {education.map((edu: any, idx: number) => (
                            <View key={idx} style={styles.entryContainer}>
                                <View style={styles.eduRow}>
                                    <View>
                                        <Text style={styles.eduDegree}>{edu.degree}</Text>
                                        <Text style={styles.eduSchool}>{edu.school || edu.institution_name}</Text>
                                    </View>
                                    <Text style={styles.eduDates}>{edu.dates}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Certifications ── */}
                {certifications.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {certifications.map((cert: any, idx: number) => (
                            <Text key={idx} style={styles.certItem}>
                                {cert.name}{cert.issuer ? ` — ` : ''}<Text style={styles.certIssuer}>{cert.issuer}</Text>
                            </Text>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    )
}
