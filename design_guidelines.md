{
  "meta": {
    "product": "GavixaCare",
    "tagline": "Clarity in Healthcare. Confidence in Every Decision.",
    "design_personality": [
      "calm confidence",
      "trustworthy",
      "expert but not condescending",
      "Stripe-like financial clarity",
      "Apple Health calm surfaces",
      "Linear-like motion polish"
    ],
    "platform_constraints": {
      "mobile_first_min_width_px": 375,
      "target_devices": "₹5–8K mid-range Android (tier-2/3)",
      "performance_notes": [
        "Prefer SVG/illustrations over heavy video",
        "Use skeletons for data-heavy pages",
        "Avoid large background images; if used, compress and lazy-load"
      ]
    },
    "testing_requirement": {
      "data_testid": "All interactive + key informational elements MUST include data-testid in kebab-case (role-based)."
    }
  },

  "brand_attributes": {
    "tone": {
      "do": [
        "Use direct, reassuring microcopy (e.g., ‘Estimated range’, ‘Why this cost varies’)",
        "Use neutral, factual language for fraud flags (avoid accusatory tone)",
        "Use emergency language that is clear and action-first"
      ],
      "dont": [
        "No fear-based marketing",
        "No alarmist red outside emergency flows",
        "No overly cute/childish visuals"
      ]
    },
    "iconography": {
      "primary": "lucide-react",
      "rules": [
        "Use 1.5px–2px stroke icons for readability on low DPI screens",
        "Never rely on color alone for status; pair with icon + label",
        "Emergency icons may use red ONLY inside Emergency Finder"
      ],
      "recommended_icons": {
        "hospital": "Hospital",
        "compare": "Columns2",
        "pricing": "IndianRupee",
        "fraud": "ShieldAlert",
        "records": "FolderLock",
        "emergency": "Siren"
      }
    }
  },

  "typography": {
    "fonts": {
      "latin_primary": {
        "name": "Inter",
        "google_fonts": "https://fonts.google.com/specimen/Inter",
        "usage": "All English UI"
      },
      "devanagari_primary": {
        "name": "Mukta",
        "fallback": "Noto Sans Devanagari",
        "usage": "Hindi UI + mixed-script labels"
      },
      "font_stack_css": "Inter, Mukta, 'Noto Sans Devanagari', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      "tabular_numbers": {
        "css": "font-variant-numeric: tabular-nums;",
        "tailwind": "tabular-nums",
        "apply_to": [
          "all ₹ amounts",
          "pricing tables",
          "bill line items",
          "value score breakdown",
          "charts axes/labels"
        ]
      }
    },
    "scale_tailwind": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "h3": "text-lg font-semibold",
      "body": "text-sm md:text-base",
      "small": "text-xs text-muted-foreground",
      "data": "text-sm tabular-nums",
      "table_header": "text-xs font-medium uppercase tracking-wide"
    },
    "line_height": {
      "dense": "leading-5",
      "default": "leading-6",
      "reading": "leading-7"
    }
  },

  "spacing": {
    "base_grid": "4px",
    "tailwind_scale_usage": {
      "xs": "p-3 gap-3",
      "sm": "p-4 gap-4",
      "md": "p-6 gap-6",
      "lg": "p-8 gap-8"
    },
    "layout_gutters": {
      "mobile": "px-4",
      "tablet": "md:px-6",
      "desktop": "lg:px-8"
    },
    "tap_targets": {
      "min": "44x44px",
      "tailwind": "min-h-11 min-w-11"
    }
  },

  "radii_shadows_motion": {
    "radius_tokens": {
      "precision": "rounded-[4px]",
      "standard": "rounded-xl",
      "friendly": "rounded-2xl",
      "pill": "rounded-full",
      "guidance": [
        "Use 4px for tables, inputs, dense cards (medical precision)",
        "Use 12–16px for standard cards",
        "Use 20–24px for marketing hero feature tiles and friendly empty states"
      ]
    },
    "shadow_tokens": {
      "card": "shadow-[0_1px_0_hsl(var(--border))] shadow-black/5",
      "popover": "shadow-lg shadow-black/10",
      "focus_ring": "ring-2 ring-ring ring-offset-2 ring-offset-background"
    },
    "motion_tokens": {
      "durations_ms": {
        "fast": 120,
        "base": 180,
        "slow": 260
      },
      "easing": {
        "standard": "cubic-bezier(0.2, 0.8, 0.2, 1)",
        "emphasis": "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      "principles": [
        "Purposeful only: motion should clarify state changes (loading → loaded, collapsed → expanded)",
        "Respect prefers-reduced-motion",
        "Avoid large parallax on low-end devices; use subtle translateY (2–6px)"
      ]
    }
  },

  "color_system": {
    "notes": [
      "No pure white backgrounds: use off-white #F8FAFC as base.",
      "Emergency Red (#DC2626) reserved ONLY for Emergency Finder and emergency CTAs.",
      "Gradients: decorative only, max 20% viewport, never on text-heavy areas."
    ],
    "palette_hex": {
      "trust_blue": "#1A56DB",
      "health_teal": "#0D9E8B",
      "clarity_orange": "#F59E0B",
      "emergency_red": "#DC2626",
      "off_white": "#F8FAFC",
      "ink": "#0B1220"
    },
    "css_variables_ready_for_index_css": {
      "light": ":root {\n  --background: 210 40% 98%; /* #F8FAFC */\n  --foreground: 222 47% 11%; /* ink */\n\n  --card: 0 0% 100%;\n  --card-foreground: 222 47% 11%;\n\n  --popover: 0 0% 100%;\n  --popover-foreground: 222 47% 11%;\n\n  --primary: 221 83% 48%; /* Trust Blue #1A56DB */\n  --primary-foreground: 210 40% 98%;\n\n  --secondary: 210 40% 96%;\n  --secondary-foreground: 222 47% 11%;\n\n  --muted: 210 40% 96%;\n  --muted-foreground: 215 16% 35%;\n\n  --accent: 173 85% 33%; /* Health Teal #0D9E8B */\n  --accent-foreground: 210 40% 98%;\n\n  --warning: 38 92% 50%; /* Clarity Orange #F59E0B */\n  --warning-foreground: 222 47% 11%;\n\n  --destructive: 0 84% 60%; /* keep for non-emergency destructive actions */\n  --destructive-foreground: 210 40% 98%;\n\n  --border: 214 32% 91%;\n  --input: 214 32% 91%;\n  --ring: 221 83% 48%;\n\n  --radius: 0.75rem;\n\n  /* Data viz */\n  --chart-1: 221 83% 48%;\n  --chart-2: 173 85% 33%;\n  --chart-3: 38 92% 50%;\n  --chart-4: 215 16% 35%;\n  --chart-5: 199 89% 48%;\n\n  /* Surfaces */\n  --surface-1: 210 40% 98%;\n  --surface-2: 210 40% 96%;\n  --surface-3: 214 32% 91%;\n\n  /* Status (non-emergency) */\n  --success: 160 84% 32%;\n  --success-foreground: 210 40% 98%;\n  --info: 199 89% 48%;\n  --info-foreground: 210 40% 98%;\n}\n",
      "dark": ".dark {\n  --background: 222 47% 7%; /* deep ink */\n  --foreground: 210 40% 98%;\n\n  --card: 222 47% 9%;\n  --card-foreground: 210 40% 98%;\n\n  --popover: 222 47% 9%;\n  --popover-foreground: 210 40% 98%;\n\n  --primary: 221 83% 60%; /* brighter Trust Blue for dark */\n  --primary-foreground: 222 47% 11%;\n\n  --secondary: 222 47% 12%;\n  --secondary-foreground: 210 40% 98%;\n\n  --muted: 222 47% 12%;\n  --muted-foreground: 215 20% 70%;\n\n  --accent: 173 85% 40%; /* teal lifts */\n  --accent-foreground: 222 47% 11%;\n\n  --warning: 38 92% 55%;\n  --warning-foreground: 222 47% 11%;\n\n  --destructive: 0 72% 45%;\n  --destructive-foreground: 210 40% 98%;\n\n  --border: 222 47% 16%;\n  --input: 222 47% 16%;\n  --ring: 221 83% 60%;\n\n  /* Data viz */\n  --chart-1: 221 83% 60%;\n  --chart-2: 173 85% 40%;\n  --chart-3: 38 92% 55%;\n  --chart-4: 215 20% 70%;\n  --chart-5: 199 89% 55%;\n\n  --surface-1: 222 47% 7%;\n  --surface-2: 222 47% 9%;\n  --surface-3: 222 47% 12%;\n\n  --success: 160 84% 38%;\n  --success-foreground: 222 47% 11%;\n  --info: 199 89% 55%;\n  --info-foreground: 222 47% 11%;\n}\n"
    },
    "allowed_gradients_decorative_only": {
      "hero_mild": "bg-[radial-gradient(1200px_circle_at_20%_10%,hsl(173_85%_92%/.9),transparent_55%),radial-gradient(900px_circle_at_80%_0%,hsl(221_83%_92%/.9),transparent_50%)]",
      "dark_hero_mild": "bg-[radial-gradient(900px_circle_at_20%_10%,hsl(173_85%_30%/.25),transparent_55%),radial-gradient(900px_circle_at_80%_0%,hsl(221_83%_45%/.22),transparent_50%)]",
      "rule": "Use only as section background overlays; never on cards/tables; keep under 20% viewport."
    },
    "status_colors": {
      "bill_flags": {
        "ok": "use --success + label 'Looks normal'",
        "review": "use --warning + label 'Needs review'",
        "high_risk": "use destructive (NOT emergency red) + label 'High risk'"
      },
      "emergency_only": {
        "cta": "#DC2626",
        "background_tint": "bg-red-50 dark:bg-red-950/30",
        "border": "border-red-200 dark:border-red-900"
      }
    }
  },

  "design_tokens_extra_css": {
    "paste_into_index_css_below_tailwind": "@layer base {\n  :root {\n    --font-sans: Inter, Mukta, 'Noto Sans Devanagari', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;\n    --radius-sm: 4px;\n    --radius-md: 12px;\n    --radius-lg: 16px;\n    --radius-xl: 24px;\n\n    --shadow-1: 0 1px 0 hsl(var(--border));\n    --shadow-2: 0 8px 24px rgba(2, 6, 23, 0.08);\n\n    --motion-fast: 120ms;\n    --motion-base: 180ms;\n    --motion-slow: 260ms;\n    --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);\n    --ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);\n  }\n\n  body {\n    font-family: var(--font-sans);\n    text-rendering: optimizeLegibility;\n  }\n\n  ::selection {\n    background: hsl(var(--primary) / 0.18);\n  }\n}\n\n/* Subtle noise overlay utility (apply to hero only) */\n.noise-overlay {\n  position: relative;\n}\n.noise-overlay::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  opacity: 0.06;\n  mix-blend-mode: multiply;\n  background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E');\n}\n"
  },

  "components": {
    "component_path": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "table": "/app/frontend/src/components/ui/table.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "command": "/app/frontend/src/components/ui/command.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx",
      "sonner_toasts": "/app/frontend/src/components/ui/sonner.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx",
      "pagination": "/app/frontend/src/components/ui/pagination.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "progress": "/app/frontend/src/components/ui/progress.jsx"
    },

    "buttons": {
      "variants": {
        "primary": {
          "use": "Primary CTA (Try Free Bill Analysis, Compare, Save)",
          "tailwind": "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring",
          "shape": "rounded-[12px] on marketing, rounded-[10px] in app",
          "micro_interaction": "hover: subtle lift (translateY -1px) + shadow-2; active: scale-95"
        },
        "secondary": {
          "use": "Secondary actions (View details, Export)",
          "tailwind": "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
          "micro_interaction": "hover: border darkens + background tint"
        },
        "ghost": {
          "use": "Toolbar actions, table row actions",
          "tailwind": "hover:bg-muted text-foreground",
          "micro_interaction": "hover: background only; no shadow"
        },
        "warning": {
          "use": "Value callouts (Savings tips, ‘Potential overcharge’ banner)",
          "tailwind": "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:opacity-90",
          "note": "Use sparingly; never for destructive actions"
        },
        "danger": {
          "use": "Delete record, remove family member (NOT emergency)",
          "tailwind": "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        },
        "emergency": {
          "use": "Emergency Finder only: Call ambulance / Call hospital",
          "tailwind": "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
          "rule": "Do not use outside Emergency Finder routes"
        }
      },
      "data_testid_examples": [
        "data-testid=\"landing-hero-primary-cta\"",
        "data-testid=\"bill-upload-submit-button\"",
        "data-testid=\"emergency-call-ambulance-button\""
      ]
    },

    "cards": {
      "data_card": {
        "use": "Dashboard KPIs (Saved hospitals, Recent analyses)",
        "structure": [
          "Header: label + icon",
          "Value: large tabular number",
          "Footer: delta / helper text"
        ],
        "tailwind": "bg-card text-card-foreground border border-border rounded-xl shadow-[var(--shadow-1)]"
      },
      "hospital_card": {
        "use": "Hospitals list",
        "must_include": [
          "Hospital name",
          "Distance + ETA",
          "Value Score chip",
          "Starting price range (₹)",
          "Bed availability pill",
          "Primary action: View",
          "Secondary: Compare"
        ],
        "tailwind": "bg-card border border-border rounded-2xl p-4 md:p-5",
        "micro_interaction": "hover: shadow-2 + border-primary/30; focus-within ring"
      },
      "alert_card": {
        "use": "Bill analyzer summary + dispute guidance",
        "tailwind": "bg-[hsl(var(--surface-2))] border border-border rounded-xl",
        "states": {
          "info": "border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/25",
          "warning": "border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/25"
        }
      }
    },

    "inputs": {
      "rules": [
        "Always show Label (shadcn Label) — placeholders are examples only",
        "Use helper text for Hindi/English clarity",
        "Error messages must be specific and actionable"
      ],
      "states": {
        "default": "border-input bg-background",
        "hover": "hover:border-foreground/20",
        "focus": "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "error": "border-destructive focus-visible:ring-destructive",
        "disabled": "disabled:opacity-60 disabled:cursor-not-allowed"
      },
      "search_pattern": {
        "component": "Command (typeahead) + Input",
        "notes": "Use typo tolerance at backend; UI shows ‘Did you mean…’ chips"
      }
    },

    "tables_financial": {
      "component": "Table",
      "style": {
        "density": "Stripe-like: compact rows, strong column alignment, sticky header",
        "tailwind": {
          "wrapper": "rounded-[4px] border border-border overflow-hidden",
          "thead": "bg-[hsl(var(--surface-2))]",
          "th": "text-xs font-medium uppercase tracking-wide text-muted-foreground",
          "td": "text-sm tabular-nums",
          "row_hover": "hover:bg-muted/60"
        }
      },
      "patterns": {
        "bill_line_items": [
          "Columns: Item | Code | Qty | Rate | Amount | Flag",
          "Flag uses Badge + icon + tooltip (no color-only)",
          "Row click opens Drawer with explanation + evidence"
        ],
        "pricing_table": [
          "Columns: Procedure | Typical range | Includes | Notes",
          "Add ‘What affects this?’ popover"
        ]
      }
    },

    "badges": {
      "status": {
        "available": "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
        "limited": "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
        "unavailable": "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
      },
      "value_score": {
        "rule": "Always show numeric score + label (e.g., 82/100 ‘Strong value’)",
        "tailwind": "bg-primary/10 text-primary border border-primary/20"
      }
    },

    "skeletons_empty_states": {
      "skeleton": {
        "component": "Skeleton",
        "rules": [
          "Match final layout (avoid generic bars)",
          "Use 2–3 shimmer blocks per card",
          "Prefer reduced motion if user requests"
        ]
      },
      "empty_states": {
        "tone": "supportive + action-first",
        "examples": [
          "No hospitals match your filters → ‘Try removing price cap or expanding distance.’",
          "No records yet → ‘Upload your first report. We’ll organize it automatically.’"
        ],
        "cta": "Use secondary button; keep primary for main flow"
      }
    },

    "toasts": {
      "library": "sonner",
      "rules": [
        "Use for confirmations only (Saved, Copied, Uploaded)",
        "Avoid toasts for critical errors; use inline alert card",
        "Emergency actions should use modal confirmation + haptic (if available)"
      ],
      "data_testid": "data-testid=\"global-toast-region\""
    }
  },

  "layouts": {
    "marketing_landing": {
      "hero": {
        "composition": [
          "Left: mission + primary CTA + trust stats",
          "Right: product preview card stack (Hospital compare + Bill analyzer snippet)",
          "Background: mild radial overlay + noise (max 20% viewport)"
        ],
        "cta": {
          "primary": "Try Free Bill Analysis",
          "secondary": "Compare Hospitals"
        },
        "trust_row": [
          "‘340M+ patients treated annually’",
          "‘70% out-of-pocket’",
          "‘60–70% bills inflated’"
        ]
      },
      "feature_grid": {
        "layout": "Bento grid (2x2 + 1 wide) with icons + short copy",
        "motion": "On scroll: fade+rise 8px; stagger 60ms"
      }
    },

    "app_shell": {
      "pattern": "Topbar + bottom nav on mobile; sidebar on md+",
      "mobile": {
        "bottom_nav": "Tabs component with 4–5 primary routes",
        "topbar": "Search + profile + theme toggle"
      },
      "desktop": {
        "sidebar": "Sheet/Resizable optional; keep width 260–280px",
        "content": "max-w-[1200px] with generous gutters"
      }
    },

    "data_page_shell": {
      "use": "Hospitals index, Bill results, Cost estimator results",
      "structure": [
        "Sticky filter bar (top) with chips",
        "Main content: list/table",
        "Right rail (md+): summary card + actions"
      ]
    },

    "detail_page_shell": {
      "use": "Hospital detail",
      "structure": [
        "Hero: hospital name + key badges + actions",
        "Below: 2-column (md+) — left content, right sticky summary",
        "Sections: Pricing, Departments, Doctors, Reviews, Accreditations"
      ]
    }
  },

  "feature_page_directions": {
    "hospital_detail_page": {
      "key_visual": "Value Score ring + breakdown bars (Price/Quality/Availability/Trust)",
      "hierarchy": [
        "Top: name + distance + availability",
        "Primary: pricing range + compare/save",
        "Secondary: departments/doctors",
        "Tertiary: reviews/accreditations"
      ],
      "data_density": "Use compact tables with sticky header; show ‘last updated’ timestamp"
    },
    "bill_analyzer_results": {
      "composition": [
        "Summary strip: Estimated overcharge % + confidence + next action",
        "Line-item table with flags",
        "Accordion: ‘Why flagged’ explanations",
        "Sticky action bar: Download report, Copy dispute questions, Start dispute"
      ],
      "color_rules": [
        "Use warning for ‘Needs review’",
        "Use destructive for ‘High risk’",
        "Avoid emergency red"
      ]
    },
    "emergency_finder": {
      "composition": [
        "Permission prompt (calm, clear)",
        "Map + list toggle",
        "Floating emergency CTA (Call 108/112)"
      ],
      "offline": "Show cached list + call actions even without map tiles"
    }
  },

  "motion_framer_examples_js": {
    "list_stagger": "// Example (JS)\nimport { motion } from 'framer-motion';\n\nexport const listVariants = {\n  hidden: { opacity: 0 },\n  show: {\n    opacity: 1,\n    transition: { staggerChildren: 0.06 }\n  }\n};\n\nexport const itemVariants = {\n  hidden: { opacity: 0, y: 8 },\n  show: { opacity: 1, y: 0, transition: { duration: 0.18 } }\n};\n",
    "pressable": "// Button micro-interaction\n<motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }}>...</motion.div>\n",
    "reduced_motion": "// Respect reduced motion\nimport { useReducedMotion } from 'framer-motion';\nconst reduce = useReducedMotion();\nconst y = reduce ? 0 : 8;\n"
  },

  "libraries": {
    "recommended": [
      {
        "name": "recharts",
        "why": "Value Score breakdown, cost range visualization, savings drivers",
        "install": "npm i recharts",
        "usage_notes": [
          "Prefer simple BarChart/AreaChart",
          "Always include empty state + aria labels",
          "Use tabular numbers for tooltips"
        ]
      }
    ],
    "maps": {
      "note": "If maps are required, prefer lightweight embed or static map fallback for low-end devices. If using Mapbox/Leaflet, lazy-load on Emergency route only."
    }
  },

  "image_urls": {
    "hero_backgrounds": [
      {
        "url": "https://images.unsplash.com/photo-1707209856660-38b8c2a89a61?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "description": "Soft blue blur for marketing hero background overlay (use with opacity 0.25 and blur-xl).",
        "category": "marketing-hero"
      },
      {
        "url": "https://images.unsplash.com/photo-1617957848811-9c07f14d7ba3?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "description": "Teal-white abstract for section header background (decorative only).",
        "category": "section-accent"
      }
    ],
    "abstract_patterns": [
      {
        "url": "https://images.unsplash.com/photo-1657215374010-786fefd1dbbc?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "description": "Subtle teal pattern for empty state illustration backdrop (very low opacity).",
        "category": "empty-state"
      },
      {
        "url": "https://images.unsplash.com/photo-1661092133357-e50572adedc1?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "description": "Abstract teal pattern for dashboard header strip (max 120px height).",
        "category": "dashboard-header"
      }
    ],
    "illustration_direction": {
      "style": "Warm inclusive flat illustrations (India diversity), minimal outlines, soft teal/blue accents, no hospital stock photos.",
      "where": [
        "Landing feature tiles",
        "Empty states",
        "Onboarding"
      ],
      "note": "Prefer custom SVG illustrations or lightweight Lottie with fallback PNG."
    }
  },

  "accessibility": {
    "checklist": [
      "WCAG AA minimum everywhere; AAA for Emergency + Bill dispute flows",
      "Contrast: ensure text on primary/teal meets AA; for small text aim AAA",
      "Keyboard navigation: visible focus ring on all interactive elements",
      "Touch targets >= 44x44",
      "Form errors: announced via aria-live region + inline message",
      "Do not rely on color alone for bill flags; include icon + label + tooltip",
      "Language toggle must be reachable and persistent",
      "Use semantic headings and landmarks"
    ]
  },

  "instructions_to_main_agent": {
    "global": [
      "Replace default template styles in /app/frontend/src/index.css with the provided CSS variables (light + dark) and extra tokens.",
      "Remove CRA demo styles in App.css (App-header centering etc.) and avoid text-align:center on containers.",
      "Use shadcn components from /src/components/ui only for inputs, dialogs, tables, etc.",
      "Ensure every button/input/link/menu item and key info element has data-testid.",
      "Implement theme toggle using .dark class on html/body and persist in localStorage.",
      "Use tabular-nums for all currency and numeric tables.",
      "Emergency Red only inside Emergency Finder routes/components."
    ],
    "page_build_order_suggestion": [
      "Landing (hero + feature grid)",
      "Auth (login/signup)",
      "App shell (topbar + bottom nav)",
      "Hospitals index + detail + compare",
      "Bill analyzer upload + results",
      "Cost estimator",
      "Emergency finder",
      "Health vault"
    ]
  },

  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
