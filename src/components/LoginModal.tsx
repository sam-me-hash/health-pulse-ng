import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';
import { HealthFacility } from '../types/facility';
import { getTranslation, Language } from '../lib/i18n';
import {
  Key,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';

const SUPER_ADMIN_PASSWORDS = [
  'V9#kR7!mQ2@xLp8Z',
  'T4$yN8&cJ5*eWs1H',
  'P7!uX3#vM9@rKa6Q',
  'L2@fZ8$wH1!nCy5R',
  'G6*eP4#qT9&jVm2X',
  'R8!bK5@hW3$zNp7L',
];

const FACILITY_ADMIN_PASSWORDS = [
  'D5#qM9!vT2@xHr8J',
  'Y7$kL4&wP1!nFs6Q',
  'C8@rV2#jH5*xZm9N',
  'N3!tG7$yW8@pKe4L',
  'F1&zQ6#bR9!mXv2H',
  'J4@hP8!cL5$wNy7T',
];

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: HealthFacility[];
  language: Language;
  onLogin: (role: 'Super Admin' | 'Facility Admin', facilityId?: string) => void;
}

export function LoginModal({ isOpen, onClose, facilities, language, onLogin }: LoginModalProps) {
  const [role, setRole] = useState<'Super Admin' | 'Facility Admin'>('Super Admin');
  const [selectedFacility, setSelectedFacility] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<{ type: string; index: number } | null>(null);
  const t = getTranslation(language);

  const handleLogin = () => {
    if (role === 'Super Admin') {
      if (SUPER_ADMIN_PASSWORDS.includes(password)) {
        toast.success('Logged in as Super Admin', {
          description: 'You have full access to all facilities.',
        });
        onLogin(role);
      } else {
        toast.error('Invalid password', {
          description: 'The password you entered does not match any Super Admin account.',
        });
      }
    } else {
      if (FACILITY_ADMIN_PASSWORDS.includes(password)) {
        if (!selectedFacility) {
          toast.error('Facility required', {
            description: 'Please select a facility to manage.',
          });
          return;
        }
        toast.success('Logged in as Facility Admin', {
          description: `You are now managing ${facilities.find((f) => f.id === selectedFacility)?.name || 'the selected facility'}.`,
        });
        onLogin(role, selectedFacility);
      } else {
        toast.error('Invalid password', {
          description: 'The password you entered does not match any Facility Admin account.',
        });
      }
    }
  };

  const copyToClipboard = async (text: string, type: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex({ type, index });
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const renderPasswordList = (
    title: string,
    icon: React.ReactNode,
    passwords: string[],
    type: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-1.5">
        {passwords.map((pwd, i) => (
          <div
            key={i}
            className="group flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1.5 text-xs font-mono text-foreground/70 transition-colors hover:border-border/70"
          >
            <span className="flex-1 truncate">{pwd}</span>
            <button
              onClick={() => copyToClipboard(pwd, type, i)}
              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
              title="Copy password"
            >
              {copiedIndex?.type === type && copiedIndex?.index === i ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{t.login}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Sign in to manage health facility data
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Role Selection */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">{t.loginAs}</Label>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as 'Super Admin' | 'Facility Admin')}
              className="flex gap-3"
            >
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/50 p-3 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value="Super Admin" id="super-admin" />
                <Label htmlFor="super-admin" className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {t.superAdmin}
                </Label>
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/50 p-3 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value="Facility Admin" id="facility-admin" />
                <Label htmlFor="facility-admin" className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                  <Key className="h-4 w-4 text-amber-500" />
                  {t.facilityAdmin}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Facility Select (only for Facility Admin) */}
          <AnimatePresence>
            {role === 'Facility Admin' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="space-y-2 overflow-hidden"
              >
                <Label className="text-sm font-medium">{t.selectFacility}</Label>
                <Select onValueChange={setSelectedFacility} value={selectedFacility}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectFacility} />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t.password}</Label>
            <div className="relative">
              <Input
                type={showPasswords ? 'text' : 'password'}
                placeholder="Enter your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPasswords ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable Credentials Drawer */}
          <div className="rounded-lg border border-border/40 bg-muted/20">
            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span>Demo Credentials</span>
              </div>
              <motion.div
                animate={{ rotate: showCredentials ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </button>
            <AnimatePresence>
              {showCredentials && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 border-t border-border/40 px-3 py-3">
                    {renderPasswordList(
                      'Super Admin Passwords',
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />,
                      SUPER_ADMIN_PASSWORDS,
                      'super'
                    )}
                    {renderPasswordList(
                      'Facility Admin Passwords',
                      <Key className="h-3.5 w-3.5 text-amber-500" />,
                      FACILITY_ADMIN_PASSWORDS,
                      'facility'
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleLogin} className="gap-1.5">
            <Shield className="h-4 w-4" />
            {t.login}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}