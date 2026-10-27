"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CircleUserRound, GraduationCap, Layers3, Mail, Menu, Printer, X } from "lucide-react";
import { profileNavigation } from "@/config/profile";
import styles from "./profile.module.css";

const navigationIcons = {
  conferencia: GraduationCap,
  inicio: CircleUserRound,
  especialidades: Layers3,
  contacto: Mail,
};

export function ProfileNavigation() {
  const [active, setActive] = useState<string>(profileNavigation[0].id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = profileNavigation.map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    // Last heading above the upper third, including sections taller than a screen.
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = Math.min(window.innerHeight * 0.32, 220);
      let current: string = profileNavigation[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) current = section.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) current = "contacto";
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        document.getElementById("profile-menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className={styles.navigationShell}>
      <div className={styles.mobileBar}>
        <a href="#inicio" className={styles.mobileBrand} onClick={() => setOpen(false)}>adán<span>.</span></a>
        <button type="button" id="profile-menu-toggle" className={styles.menuToggle}
          aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}
          aria-controls="profile-navigation" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <nav id="profile-navigation" aria-label="Perfil personal" className={`${styles.navigation} ${open ? styles.navigationOpen : ""}`}>
        {profileNavigation.map((item) => {
          const Icon = navigationIcons[item.id];
          return <a key={item.id} href={`#${item.id}`} className={active === item.id ? styles.activeLink : undefined}
            aria-current={active === item.id ? "location" : undefined} onClick={() => setOpen(false)}>
            <Icon size={17} aria-hidden="true" />{item.label}<ArrowUpRight size={15} className={styles.navigationArrow} aria-hidden="true" />
          </a>;
        })}
      </nav>
    </div>
  );
}

export function PrintProfileButton() {
  return <button type="button" className={styles.secondaryButton} onClick={() => window.print()}>
    <Printer size={17} aria-hidden="true" /> Imprimir perfil
  </button>;
}
