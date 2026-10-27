import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Code2, Compass, MapPin, Sparkles } from "lucide-react";
import { PrintProfileButton, ProfileNavigation } from "@/components/profile/profile-navigation";
import { ConferenceToolkit } from "@/components/conference/conference-toolkit";
import { PublicProfileImage } from "@/components/profile/public-profile-image";
import { ClientLogosVideo } from "@/components/profile/client-logos-video";
import { SocialIcon } from "@/components/profile/social-icon";
import { SkeletonReveal } from "@/components/motion/skeleton-reveal";
import { LandingContentSkeleton } from "@/components/profile/landing-content-skeleton";
import { companySocialLinks, profile, profileAssets, profileMedia } from "@/config/profile";
import styles from "@/components/profile/profile.module.css";

const title = `${profile.name} · Estrategia digital y tecnología`;

export const metadata: Metadata = {
  title,
  description: profile.description,
  alternates: { canonical: "/" },
  authors: [{ name: profile.name }],
  icons: { icon: { url: profileAssets.icon, type: "image/png" } },
  openGraph: {
    title, description: profile.description, url: "/", siteName: profile.name,
    locale: "es_MX", type: "website",
  },
  twitter: { card: "summary_large_image", title, description: profile.description },
};

const specialtyIcons = [Code2, Sparkles, Compass];

function Monogram() {
  return (
    <div className={styles.monogram} aria-hidden="true">
      <div className={styles.artworkGrid} />
      <div className={styles.orbitOuter} />
      <div className={styles.orbitInner} />
      <div className={styles.monogramLetters}>{profile.initials}<span>.</span></div>
      <span className={styles.orbitDot} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.site}>
      <a className={styles.skipLink} href="#contenido">Saltar al contenido</a>
      <div className={styles.pageWrap}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.wordmark} aria-label={`${profile.name}, inicio`}>
            adán<span>.</span><span className={styles.wordmarkSubtitle}>SALAZAR</span>
          </Link>
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Perfil de Adán Salazar">
            <div className={styles.profileCard}>
              <div className={styles.profileCover}>
                {profile.photo ? (
                  <PublicProfileImage src={profile.photo} alt={profile.name}
                    sizes="(max-width: 760px) 100px, 264px" className={styles.profilePhoto} eager>
                    <Monogram />
                  </PublicProfileImage>
                ) : <Monogram />}
              </div>
              <div className={styles.profileInfo}>
                <p className={styles.profileName}>{profile.name}</p>
                <p className={styles.profileRole}>{profile.position}</p>
                <p className={styles.profileLocation}><MapPin size={13} aria-hidden="true" />{profile.location}</p>
              </div>
            </div>
            <section className={styles.sidebarSkills} aria-labelledby="profile-skills-title">
              <div className={styles.skillsHeading}><h2 id="profile-skills-title">Habilidades</h2><Compass size={18} aria-hidden="true" /></div>
              <ul>{profile.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
            </section>
          </aside>
          <ProfileNavigation />

          <main id="contenido" className={styles.content} tabIndex={-1}>
            <SkeletonReveal skeleton={<LandingContentSkeleton />}>
              <ConferenceToolkit />

              <section id="inicio" className={`${styles.panel} ${styles.hero}`} aria-labelledby="hero-title">
                <h1 id="hero-title">Expertos en <br /><strong>Soluciones Digitales</strong></h1>
                <div className={styles.heroCompany}>
                  <PublicProfileImage src={profileAssets.logoWhite} alt={profile.company}
                    className={styles.companyLogo} sizes="200px">
                    <span>{profile.company}</span>
                  </PublicProfileImage>
                </div>
                <div className={styles.companyActions}>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className={styles.siteButton}>
                    Visita nuestro sitio<ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                  <div className={styles.socialLinks} role="group" aria-label="Redes de Salazar Consultores">
                    {companySocialLinks.map((social) => (
                      <a key={social.network} href={social.href} target="_blank" rel="noopener noreferrer"
                        aria-label={social.label} title={social.label}>
                        <SocialIcon network={social.network} />
                      </a>
                    ))}
                  </div>
                </div>
              </section>

              <section id="especialidades" className={styles.panel} aria-labelledby="specialties-title">
                <h2 id="specialties-title">Lo que puedo resolver.</h2>
                <div className={styles.specialtyGrid}>
                  {profile.specialties.map((specialty, index) => {
                    const Icon = specialtyIcons[index];
                    return (
                      <article key={specialty.title} className={styles.specialtyCard}>
                        <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                        <h3>{specialty.title}</h3>
                        <p>{specialty.description}</p>
                      </article>
                    );
                  })}
                </div>
                <ClientLogosVideo src={profileMedia.clientLogosVideo} />
              </section>

              <section id="contacto" className={`${styles.panel} ${styles.contact}`} aria-labelledby="contact-title">
                <h2 id="contact-title">Conectemos ideas <span className={styles.ideaEmoji}>💡</span></h2>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                  className={styles.contactButton} aria-label="Conectar con Adán Salazar en LinkedIn">
                  <SocialIcon network="linkedin" />Mi LinkedIn<ArrowUpRight size={18} aria-hidden="true" />
                </a>
                <p className={styles.printUrl}>https://salazar.red/</p>
              </section>

              <footer className={styles.footer}><span>salazar.red</span><PrintProfileButton /></footer>
            </SkeletonReveal>
          </main>
        </div>
      </div>
    </div>
  );
}
