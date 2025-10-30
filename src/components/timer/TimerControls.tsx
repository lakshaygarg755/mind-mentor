import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export default function TimerControls({ isActive, onToggle, onReset }: TimerControlsProps) {
  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isActive) {
      onToggle(); // Pause first if active
    }
    onReset();
  };

  return (
    <div className="flex justify-center gap-4">
      <Button
        onClick={onToggle}
        className="w-32 bg-[#c1ff72] hover:bg-[#b1ef62] text-black"
      >
        {isActive ? (
          <>
            <Pause className="w-4 h-4 mr-2" /> Pause
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" /> Start
          </>
        )}
      </Button>
      <Button
        onClick={handleReset}
        variant="outline"
        className="w-32 border-2 border-black"
      >
        <RotateCcw className="w-4 h-4 mr-2" /> Reset
      </Button>
    </div>
  );
} 