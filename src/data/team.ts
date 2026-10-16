/**
 * Academy team shown in the "Team" section.
 * Photos: put `<slug>.jpg` (or .png / .webp) in `src/assets/team/` — see the README there.
 */
export interface Member {
  slug: string;
  name: string;
  /** Professional title — kept in English on both language versions. */
  title: string;
}

export const projectLead: Member = {
  slug: 'dorra-bechaouch',
  name: 'Dorra Bechaouch',
  title: 'English Teacher & Business Communication Trainer',
};

export const coordinators: Member[] = [
  { slug: 'wahid-mensia', name: 'Wahid Mensia', title: 'Big Data Analytics Graduate' },
  { slug: 'nour-ben-hadj-amor', name: 'Nour Ben Hadj Amor', title: 'Marketing Graduate' },
  { slug: 'yasmine-merichko', name: 'Yasmine Merichko', title: 'Business Student' },
  { slug: 'khawla-chaabi', name: 'Khawla Chaabi', title: 'Business Intelligence Student' },
];
