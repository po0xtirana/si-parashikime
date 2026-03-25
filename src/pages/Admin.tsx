import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMarkets } from "@/hooks/useMarkets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Constants } from "@/integrations/supabase/types";
import { Shield, Plus, CheckCircle } from "lucide-react";

const categoryLabels: Record<string, string> = {
  Politics: "Politikë",
  Sports: "Sport",
  Economy: "Ekonomi",
  Entertainment: "Argëtim",
  Technology: "Teknologji",
  Other: "Të tjera",
};

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const { data: markets } = useMarkets();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [endTime, setEndTime] = useState("");
  const [seedYes, setSeedYes] = useState("500");
  const [seedNo, setSeedNo] = useState("500");
  const [imageUrl, setImageUrl] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [creating, setCreating] = useState(false);

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const createMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !endTime) { toast.error("Titulli dhe koha e mbarimit janë të detyrueshme"); return; }
    setCreating(true);

    const { error } = await supabase.from("markets").insert({
      title: title.trim(),
      description: description.trim() || null,
      category: category as "Politics" | "Sports" | "Economy" | "Entertainment" | "Technology" | "Other",
      end_time: new Date(endTime).toISOString(),
      seed_yes: parseFloat(seedYes) || 500,
      seed_no: parseFloat(seedNo) || 500,
      image_url: imageUrl.trim() || null,
      article_url: articleUrl.trim() || null,
      created_by: user.id,
    });

    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Tregu u krijua me sukses!");
    setTitle(""); setDescription(""); setEndTime(""); setImageUrl(""); setArticleUrl("");
    queryClient.invalidateQueries({ queryKey: ["markets"] });
  };

  const resolveMarket = async (marketId: string, outcome: boolean) => {
    const { data, error } = await supabase.rpc("resolve_market", {
      p_market_id: marketId,
      p_winning_outcome: outcome,
    });
    const result = data as Record<string, unknown> | null;
    if (error || (result && result.error)) {
      toast.error(String(result?.error || error?.message));
    } else {
      toast.success(`Tregu u zgjidh si ${outcome ? "PO" : "JO"}`);
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    }
  };

  const unresolvedMarkets = markets?.filter((m) => m.status !== "resolved") ?? [];

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="h-6 w-6" />
        <h1 className="font-serif text-3xl font-bold">Paneli i Administratorit</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5" />
            <h2 className="font-serif text-xl font-semibold">Krijo Treg</h2>
          </div>
          <form onSubmit={createMarket} className="space-y-4">
            <div className="space-y-2">
              <Label>Titulli</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A do të ndodhë X?" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>Përshkrimi</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kontekst shtesë..." maxLength={1000} />
            </div>
            <div className="space-y-2">
              <Label>Kategoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.market_category.map((cat) => (
                    <SelectItem key={cat} value={cat}>{categoryLabels[cat] || cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Koha e Mbarimit</Label>
              <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Seed PO</Label>
                <Input type="number" value={seedYes} onChange={(e) => setSeedYes(e.target.value)} min="100" />
              </div>
              <div className="space-y-2">
                <Label>Seed JO</Label>
                <Input type="number" value={seedNo} onChange={(e) => setSeedNo(e.target.value)} min="100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL e Fotos (opsionale)</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label>Linku i Artikullit (opsionale)</Label>
              <Input
                type="url"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                placeholder="https://www.gazetasi.al/..."
                maxLength={500}
              />
            </div>
            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? "Duke krijuar..." : "Krijo Tregun"}
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5" />
            <h2 className="font-serif text-xl font-semibold">Zgjidh Tregjet</h2>
          </div>
          {unresolvedMarkets.length === 0 ? (
            <p className="text-muted-foreground text-sm">Asnjë treg i pazgjidhur.</p>
          ) : (
            <div className="space-y-3">
              {unresolvedMarkets.map((m) => (
                <div key={m.id} className="rounded-md border border-border p-3">
                  <p className="text-sm font-semibold mb-1 line-clamp-1">{m.title}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Pool: {(m.total_yes + m.total_no).toLocaleString()} SI | Statusi: {m.status}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-success border-success/30 hover:bg-success/10" onClick={() => resolveMarket(m.id, true)}>
                      Zgjidh PO
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-danger border-danger/30 hover:bg-danger/10" onClick={() => resolveMarket(m.id, false)}>
                      Zgjidh JO
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
