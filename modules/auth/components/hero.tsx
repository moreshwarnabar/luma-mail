import Image from 'next/image';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="w-3/5 flex flex-col justify-center gap-4 px-4">
      <Card className="pt-0 overflow-hidden">
        <CardContent className="px-0">
          <div>
            <Image
              src="/video-sub.jpg"
              alt="Video Substitute"
              width={1024}
              height={512}
            />
          </div>
          <div className="p-4">
            <h1 className="text-xl font-bold">
              Email, reimagined for clarity.
            </h1>
            <p className="text-justify">
              Luma Mail cuts through the noise with AI-powered organization,
              instant summaries, and natural-tone drafting — all in a fast,
              minimal experience designed to keep you focused.
            </p>
          </div>
          <div className="relative text-center text-sm mx-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700"></span>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 rounded-full border border-slate-300">
                Made with ❤️ by Moreshwar
              </span>
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-3">
            <a
              href="https://www.linkedin.com/in/moreshwar-rajan-nabar/"
              target="_blank"
            >
              <Button
                size="icon"
                variant="outline"
                className="rounded-full hover:cursor-pointer"
              >
                <FaLinkedinIn />
              </Button>
            </a>
            <a href="https://github.com/moreshwarnabar" target="_blank">
              <Button
                size="icon-lg"
                variant="outline"
                className="rounded-full hover:cursor-pointer"
              >
                <FaGithub />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Hero;
