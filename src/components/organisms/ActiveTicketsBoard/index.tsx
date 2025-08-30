import TicketTree from '../TicketTree';
import { ParentTask, SubTask } from '../../../types';
import SectionTitle from '../../atoms/SectionTitle';
import IconBoard from '../../atoms/icons/Board';

interface ActiveTicketsBoardProps {
  groups: { parent: ParentTask; children: SubTask[] }[];
}

export default function ActiveTicketsBoard({ groups }: ActiveTicketsBoardProps) {
  console.log('ActiveTicketsBoard groups:', groups);
  
  return (
    <section>
      <SectionTitle variant="emerald" icon={<IconBoard />}>Active Tickets</SectionTitle>
      <div className="space-y-3">
        {groups.map((g, idx) => {
          console.log(`Group ${idx}:`, g);
          return (
            <TicketTree key={idx} parent={g.parent} subtasks={g.children} />
          );
        })}
      </div>
    </section>
  );
} 