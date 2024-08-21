import type { OverlayContentProps } from 'overlay-manager-rc/dist';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog.tsx';

export function TestContent({
  open,
  data,
  close,
}: OverlayContentProps<string>) {
  return (
    <AlertDialog
      onOpenChange={(v) => {
        !v && close();
      }}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alert title</AlertDialogTitle>
          <AlertDialogDescription>Get Data: {data}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
