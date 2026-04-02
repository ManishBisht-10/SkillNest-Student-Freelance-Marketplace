import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getConsumerProfile, updateConsumerProfile } from "../api/consumer.api";
import ConsumerPageSkeleton from "../components/ConsumerPageSkeleton";

export default function ConsumerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getConsumerProfile();
        setName(response.user?.name || "");
        setCompanyName(response.profile?.companyName || "");
        setWebsite(response.profile?.website || "");
      } catch {
        toast.error("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const canSave = useMemo(() => name.trim().length >= 2, [name]);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      await updateConsumerProfile({
        name: name.trim(),
        companyName: companyName.trim(),
        website: website.trim(),
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ConsumerPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">Consumer Profile</h1>
        <p className="mt-1 text-sm text-text/70">Update your account and company information.</p>
      </section>

      <form className="grid gap-3 rounded-2xl border border-secondary/70 bg-secondary/20 p-5" onSubmit={onSave}>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Labs"
        />
        <Input
          label="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />

        <Button type="submit" disabled={!canSave || saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
