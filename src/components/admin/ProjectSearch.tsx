"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { regToken } from "@/lib/slug";

type Suggestion = { registration_no: string; project_name?: string; district?: string; live: boolean };

/**
 * The pipeline board's search box, with project-name suggestions as you type.
 * Picking one opens that project; Enter without a pick submits the form as before.
 */
export function ProjectSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      const district = (inputRef.current?.form?.elements.namedItem("district") as HTMLSelectElement | null)?.value ?? "";
      fetch(`/admin/suggest?${new URLSearchParams({ q, district })}`, { signal: ctrl.signal })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: Suggestion[]) => {
          setItems(data);
          setActive(-1);
        })
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [value]);

  const pick = (s: Suggestion) => {
    setOpen(false);
    router.push(`/admin/projects/${regToken(s.registration_no)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && items.length > 0;

  return (
    <div className="adm-suggest">
      <input
        ref={inputRef}
        id="f-q"
        type="text"
        name="q"
        value={value}
        placeholder="Project name or RERA no."
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls="f-q-list"
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `f-q-opt-${active}` : undefined}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul id="f-q-list" className="adm-suggest-list" role="listbox">
          {items.map((s, i) => (
            <li
              key={s.registration_no}
              id={`f-q-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? "is-active" : undefined}
              // mousedown, not click: fires before the input's blur closes the list
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="adm-suggest-name">{s.project_name || s.registration_no}</span>
              <span className="adm-row-meta">
                {s.registration_no}
                {s.district ? ` · ${s.district}` : ""}
                {s.live ? " · Live" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
