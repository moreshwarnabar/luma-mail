import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';

interface Props {
  isOpen: boolean;
  closeModal: (modalOpen: boolean) => void;
}

const ConnectAccountModal = ({ isOpen, closeModal }: Props) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect an Account</DialogTitle>
          <DialogDescription>
            Use an existing account, or sign up with a new email.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col gap-2 w-64">
            <Link href="/api/auth/google">
              <Button className="w-full relative pl-10 pr-4 flex items-center justify-center">
                <span className="absolute left-4 flex items-center">
                  <FaGoogle />
                </span>
                <span className="mx-auto">Continue with Google</span>
              </Button>
            </Link>
            <Link href="#">
              <Button className="w-full relative pl-10 pr-4 flex items-center justify-center">
                <span className="absolute left-4 flex items-center">
                  <FaMicrosoft />
                </span>
                <span className="mx-auto">Continue with Microsoft</span>
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">More options coming soon...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectAccountModal;
