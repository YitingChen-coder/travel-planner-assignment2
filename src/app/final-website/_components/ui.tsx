"use client";
import { useEffect, useRef, useId } from "react";
import type { ReactNode } from "react";
import styles from "./planner.module.css";
export function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={styles.modal}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className={styles.modalTop}>
        <span className={styles.eyebrow}>THE QUIET WAY / YOUR JOURNEY</span>
        <button
          className={styles.iconButton}
          onClick={onClose}
          aria-label="Close dialog"
          autoFocus
        >
          ×
        </button>
      </div>
      <h2 id={`${id}-title`}>{title}</h2>
      <p id={`${id}-description`} className={styles.muted}>
        {description}
      </p>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  id,
  error,
  children,
  hint,
}: {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {children}
      {(error || hint) && (
        <p id={`${id}-help`} className={error ? styles.error : styles.hint}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
export function Confirm({
  title,
  description,
  onClose,
  onConfirm,
  label = "Remove",
}: {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  label?: string;
}) {
  return (
    <Modal title={title} description={description} onClose={onClose}>
      <div className={styles.modalActions}>
        <button className={styles.secondary} onClick={onClose}>
          Keep it
        </button>
        <button className={styles.destructive} onClick={onConfirm}>
          {label}
        </button>
      </div>
    </Modal>
  );
}
