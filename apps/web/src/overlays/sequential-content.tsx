import { useOverlay } from 'overlay-manager-rc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { Button } from '@components/ui/button.tsx';
import { useOpenSequential } from '@/hooks/useOpenSequential.ts';

interface SequentialData {
  step: number;
  totalSteps: number;
  message: string;
}

export function SequentialContent() {
  const { isOpen, overlayData, closeOverlay } = useOverlay<SequentialData>();
  const { openSequential } = useOpenSequential();

  const handleNext = () => {
    const currentStep = overlayData?.step ?? 1;
    const totalSteps = overlayData?.totalSteps ?? 3;

    if (currentStep < totalSteps) {
      // 다음 dialog를 중복으로 열기 (현재 dialog는 닫지 않음)
      openSequential(currentStep + 1, totalSteps);
    } else {
      // 마지막 dialog면 닫기
      closeOverlay('finish');
    }
  };

  return (
    <Dialog
      onOpenChange={(v) => {
        !v && closeOverlay();
      }}
      open={isOpen}
    >
      <DialogContent className="sm:max-w-[600px] sm:h-[450px] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Dialog {overlayData?.step} / {overlayData?.totalSteps}
          </DialogTitle>
          <DialogDescription>
            {overlayData?.message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1" />
        <DialogFooter className="mt-auto">
          <Button variant="outline" onClick={() => closeOverlay('cancelled')}>
            Cancel
          </Button>
          <Button onClick={handleNext}>
            {overlayData?.step === overlayData?.totalSteps ? 'Finish' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
