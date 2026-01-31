import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface FilterButtonProps {
  name: string;
  isSelected: boolean;
}

const FilterButton = ({ name, isSelected }: FilterButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = () => {
    const urlParams = new URLSearchParams(searchParams);
    if (name === 'all') urlParams.delete('filter');
    else urlParams.set('filter', name);

    router.push(`${pathname}?${urlParams.toString()}`);
  };

  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      className="rounded-3xl capitalize"
      onClick={updateFilter}
    >
      {name === 'personal' ? 'primary' : name}
    </Button>
  );
};

export default FilterButton;
