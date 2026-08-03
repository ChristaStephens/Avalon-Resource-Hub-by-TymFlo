export interface SupportOptionGroup {
  label: string;
  options: string[];
}

export const SUPPORT_OPTION_GROUPS: SupportOptionGroup[] = [
  {
    label: "Pregnancy & Birth",
    options: [
      "Childbirth Education",
      "Diagnostic Ultrasound",
      "Fetal Care Services",
      "High Risk Pregnancy",
      "Labor and Delivery",
      "Live Birth",
      "Maternity Care - Obstetrics",
      "OB Triage + Emergency Services",
      "Prenatal + Birth Doula Support",
      "Prenatal Care",
      "Prenatal/Postpartum Yoga",
      "Pregnancy Confirmations",
      "Pregnancy Fitness Classes",
      "Pregnancy Tests",
      "Ultrasounds",
    ],
  },
  {
    label: "Postpartum & Newborn",
    options: [
      "Breastfeeding Education",
      "Infant Care - Pediatrics",
      "Infant CPR Training",
      "Neonatal Intensive Care",
      "Newborn Care",
      "Newborn Education",
      "Postpartum Doula Support",
      "Postpartum Education",
      "Safe Sleep Education",
    ],
  },
  {
    label: "Family Planning & Reproductive Health",
    options: [
      "Abortion Support",
      "Contraception",
      "Family Planning",
      "Fertility Services",
      "Genetic Counseling",
      "HIV Testing",
      "Infertility",
      "Pap Smears",
      "Reproductive Health - Gynecology",
      "STI Testing",
      "Termination",
    ],
  },
  {
    label: "Mental Health & Emotional Support",
    options: [
      "Behavioral",
      "Grief and Loss Mental Health Support",
      "Grief/Loss",
      "Loss Support Group",
      "Medication Management",
      "Mental Health Support",
      "Perinatal Mental Health",
      "Pro-bono Mental Health",
      "Psychiatric Evaluation",
      "Psychological Evaluation",
      "Therapy",
      "Trauma-Informed",
    ],
  },
  {
    label: "Pediatrics & Child Health",
    options: [
      "Baby Care Supplies",
      "Carseat Checks",
      "Children Allowed at Appointment",
      "General Pediatrics",
      "Pediatric Emergency Services",
      "Pediatric Specialists",
      "Pediatric Surgeons",
    ],
  },
  {
    label: "Community & Family Support",
    options: [
      "Childcare",
      "Fatherhood Support",
      "Fatherhood Support Group - Cost",
      "Fatherhood Support Group - Free",
      "Housing",
      "Legal",
      "Mentorship",
      "Motherhood Support",
      "Motherhood Support Group - Cost",
      "Motherhood Support Group - Free",
      "Parenting Education",
      "Parenting Support Groups",
    ],
  },
  {
    label: "Provider Identity & Access",
    options: [
      "Accepts Medicaid",
      "Accepts Private Insurance",
      "Black Provider",
      "Gender Affirming Care",
      "In-Person Session",
      "LGBTQIA + Affirming Provider",
      "Offers Sliding Scale",
      "Spanish Speaking Provider",
      "Telehealth Session",
      "Undocumented",
      "Uninsured",
    ],
  },
  {
    label: "General Health",
    options: [
      "Chronic Care",
      "Dental",
      "Diabetes Education",
      "Nutrition Education",
      "Transportation",
    ],
  },
];

/** Flat list derived from groups — used anywhere a plain string[] is needed */
export const ALL_SUPPORT_OPTIONS: string[] = SUPPORT_OPTION_GROUPS.flatMap(
  (g) => g.options
);
