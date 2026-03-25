import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DISCLAIMER_KEY = "si_disclaimer_accepted";

export default function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISCLAIMER_KEY)) {
      setOpen(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(DISCLAIMER_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Njoftim Ligjor</DialogTitle>
          <DialogDescription className="text-muted-foreground leading-relaxed pt-2">
            Kreditet SI janë një <strong>mjet reputacioni</strong> për komunitetin e Gazetës SI.
            Ato <strong>nuk kanë vlerë monetare</strong> dhe <strong>nuk mund të konvertohen në para</strong>.
            <br /><br />
            SI Parashikime është një ushtrim intelektual në inteligjencën kolektive dhe vlerësimin e probabilitetit.
            Duke vazhduar, ju pranoni se të gjitha parashikimet bëhen vetëm për qëllime argëtimi dhe edukimi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={accept} className="w-full font-semibold">
            Kuptoj — Hyr në SI Parashikime
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
