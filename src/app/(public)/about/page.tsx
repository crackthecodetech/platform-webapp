import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrainerProfile } from '@/components/TrainerProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import LocationMap from '@/components/LocationMap'; // Import the map component

const Instagram = dynamic(() =>
    import('lucide-react').then((mod) => mod.Instagram),
);
const Mail = dynamic(() => import('lucide-react').then((mod) => mod.Mail));
const Briefcase = dynamic(() =>
    import('lucide-react').then((mod) => mod.Briefcase),
);
const Star = dynamic(() => import('lucide-react').then((mod) => mod.Star));
const Award = dynamic(() => import('lucide-react').then((mod) => mod.Award));
const Linkedin = dynamic(() =>
    import('lucide-react').then((mod) => mod.Linkedin),
);
const Facebook = dynamic(() =>
    import('lucide-react').then((mod) => mod.Facebook),
);
const FaXTwitter = dynamic(() =>
    import('react-icons/fa6').then((mod) => mod.FaXTwitter),
);

export default function AboutPage() {
    return (
        <div className="bg-slate-50 text-slate-900">
            <section className="overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white border-b border-slate-200">
                <div className="container mx-auto px-6 py-24 sm:py-32 text-center">
                    <h2 className="text-base font-semibold tracking-wide text-sky-600 uppercase">
                        About CrackTheCode
                    </h2>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl text-balance">
                        Classroom to Career in Software Development
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-slate-600">
                        We bridge the gap between academic knowledge and
                        industry demands, equipping you with the practical
                        skills to thrive in the tech world.
                    </p>
                </div>
            </section>
            <section id="mission" className="py-24 sm:py-32">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-96 w-full rounded-2xl shadow-xl ring-1 ring-slate-900/5">
                            <Image
                                src="/full-logo.svg"
                                alt="CrackTheCode Classroom"
                                fill
                                className="object-contain p-8"
                                priority
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
                                Our Mission
                            </h2>
                            <p className="mt-6 text-lg leading-relaxed text-slate-600">
                                We are a premium training institute dedicated to
                                empowering students and professionals through
                                hands-on and practical learning in a dynamic
                                classroom environment. With a focus on practical
                                skills and IT world readiness, we specialize in
                                building real-time projects and equipping
                                learners with recruitment essentials.
                            </p>
                            <p className="mt-4 text-lg leading-relaxed text-slate-600">
                                At CTC, we combine expert mentorship,
                                interactive sessions, and real-world
                                applications to ensure our students are not only
                                prepared but stand out in today&apos;s
                                competitive job market.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="pb-24 sm:pb-32">
                <div className="container mx-auto px-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                            <h3 className="text-2xl font-bold text-slate-800 text-center md:text-left">
                                Find Us On Social Media
                            </h3>
                            <TooltipProvider>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <SocialLink
                                        href="https://www.instagram.com/crackthecode.tech"
                                        aria-label="Instagram"
                                        title={'Instagram'}
                                    >
                                        <Instagram className="h-6 w-6" />
                                    </SocialLink>
                                    <SocialLink
                                        href="mailto:crackthecode.tech@gmail.com"
                                        aria-label="Email"
                                        title={'Email'}
                                    >
                                        <Mail className="h-6 w-6" />
                                    </SocialLink>
                                    <SocialLink
                                        href="https://x.com/crackthecodeCTC"
                                        aria-label="Twitter"
                                        title="Twitter"
                                    >
                                        <FaXTwitter className="h-6 w-6" />
                                    </SocialLink>
                                    <SocialLink
                                        href="https://www.linkedin.com/company/crackthecode-tech"
                                        aria-label="LinkedIn"
                                        title="LinkedIn"
                                    >
                                        <Linkedin className="h-6 w-6" />
                                    </SocialLink>
                                    <SocialLink
                                        href="https://www.facebook.com/share/12KdsPcxfNN/?mibextid=wwXIfr"
                                        aria-label="Facebook"
                                        title="Facebook"
                                    >
                                        <Facebook className="h-6 w-6" />
                                    </SocialLink>
                                </div>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </section>
            <section
                id="instructor"
                className="bg-white py-24 sm:py-32 border-y border-slate-200"
            >
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Meet The Instructor
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-slate-600 text-balance">
                            Our courses are led by industry veterans with a
                            passion for teaching and a wealth of real-world
                            experience.
                        </p>
                    </div>
                    <div className="mt-16 max-w-4xl mx-auto">
                        <TrainerProfile
                            name="Dimbu Keshava Reddy"
                            title="Founder & Lead Instructor"
                            bio="Technical Trainer with 9+ years of experience in training lakhs of students in technical skills, aptitude, and interview preparation. Passionate about making learning engaging, results-driven, and industry-relevant. Expert in preparing students for placements, competitive exams, and corporate success."
                            imageUrl="/logo.svg"
                            skills={[
                                'Data Structures & Algorithms',
                                'Python',
                                'Java',
                                'Aptitude',
                            ]}
                            github="https://github.com/DimbuKeshavaReddy"
                            linkedin="https://www.linkedin.com/in/dimbu-keshava-reddy"
                            twitter="https://x.com/dimbukeshavare1"
                        />
                    </div>
                </div>
            </section>
            <section id="what-we-do" className="py-24 sm:py-32">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
                                Our Approach to Learning
                            </h2>
                            <p className="mt-6 text-lg leading-relaxed text-slate-600">
                                We believe learning to code should be an
                                inspiring journey, not a chore. Our curriculum
                                is designed to give you practical skills and a
                                deep understanding of core concepts that last a
                                lifetime.
                            </p>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <FeatureCard
                                icon={<Briefcase />}
                                title="Real-World Projects"
                                description="Build practical projects from scratch to deeply understand Data Structures, Algorithms, and their real-world applications."
                            />
                            <FeatureCard
                                icon={<Star />}
                                title="Expert Mentorship"
                                description="Receive direct guidance and constructive feedback from trainers who possess expert-level knowledge and industry experience."
                            />
                            <FeatureCard
                                icon={<Award />}
                                title="Career Focused"
                                description="We prioritize job-readiness, from mastering complex data structures to acing high-stakes technical interviews."
                            />
                            <div className="sm:col-span-2 p-8 bg-white/80 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="font-semibold text-slate-800 mb-4">
                                    Key Focus Areas:
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1 text-sm"
                                    >
                                        Data Structures
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1 text-sm"
                                    >
                                        Algorithms
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1 text-sm"
                                    >
                                        Java
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1 text-sm"
                                    >
                                        Python
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1 text-sm"
                                    >
                                        Interview Prep
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section
                id="location"
                className="py-24 sm:py-32 bg-white border-t border-slate-200"
            >
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Our Location
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-slate-600">
                            We are located in the heart of Hyderabad, Telangana,
                            India.
                        </p>
                    </div>
                    <div className="mt-16 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-900/5">
                        <LocationMap />
                    </div>
                </div>
            </section>
        </div>
    );
}

const SocialLink = ({
    href,
    title,
    children,
}: {
    href: string;
    title: string;
    children: React.ReactNode;
}) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={title}
                className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-blue-700 ring-1 ring-slate-200 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-sky-500 hover:text-white"
            >
                {children}
            </Link>
        </TooltipTrigger>
        <TooltipContent>
            <p>{title}</p>
        </TooltipContent>
    </Tooltip>
);

const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: React.ReactElement;
    title: string;
    description: string;
}) => (
    <Card className="shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                {React.cloneElement(icon)}
            </div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </CardContent>
    </Card>
);
