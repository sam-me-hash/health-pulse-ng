import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Language, translations } from "@/lib/i18n";
import { Hospital, LogIn, LogOut, LayoutDashboard, Menu, Home, X, Search } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  language: Language;
  setLanguage: (language: Language) => void;
  userRole: 'Super Admin' | 'Facility Admin' | null;
  handleLogout: () => void;
  setLoginModalOpen: (isOpen: boolean) => void;
  t: typeof translations['en'];
}

const navItemVariants = {
  initial: { x: -20, opacity: 0 },
  animate: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.05 * i, type: "spring", stiffness: 200, damping: 20 },
  }),
  tap: { scale: 0.97 },
};

const iconVariants = {
  hover: { scale: 1.15, rotate: [0, -5, 5, 0], transition: { type: "spring", stiffness: 400, damping: 10 } },
  tap: { scale: 0.9 },
};

export const Header = ({ language, setLanguage, userRole, handleLogout, setLoginModalOpen, t }: HeaderProps) => {
  return (
    <header className="p-3 sm:p-4 border-b sticky top-0 bg-background/80 backdrop-blur-xl z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center min-h-[44px]">
        <div className="flex items-center gap-3 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden min-w-[44px] min-h-[44px] rounded-full"
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-6">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle className="flex items-center gap-3 text-xl">
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <LayoutDashboard className="h-7 w-7 text-primary" />
                  </motion.div>
                  {t.title}
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                <SheetClose asChild>
                  <motion.div
                    custom={0}
                    variants={navItemVariants}
                    initial="initial"
                    animate="animate"
                    whileTap="tap"
                  >
                    <NavLink
                      to="/"
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 text-lg font-medium transition-all rounded-xl px-4 py-3 min-h-[48px]",
                        "hover:bg-primary/10 hover:text-primary active:scale-[0.98]",
                        isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                      )}
                    >
                      <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                        <Home className="h-5 w-5 sm:h-6 sm:w-6" />
                      </motion.div>
                      {t.title === "Mai Kula da Samar da Lafiya ta Gombe" ? "Gida" : "Home"}
                    </NavLink>
                  </motion.div>
                </SheetClose>
                <SheetClose asChild>
                  <motion.div
                    custom={1}
                    variants={navItemVariants}
                    initial="initial"
                    animate="animate"
                    whileTap="tap"
                  >
                    <NavLink
                      to="/facilities"
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 text-lg font-medium transition-all rounded-xl px-4 py-3 min-h-[48px]",
                        "hover:bg-primary/10 hover:text-primary active:scale-[0.98]",
                        isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                      )}
                    >
                      <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                        <Hospital className="h-5 w-5 sm:h-6 sm:w-6" />
                      </motion.div>
                      {t.facilities}
                    </NavLink>
                  </motion.div>
                </SheetClose>
                <hr className="my-4" />
                <div className="flex flex-col gap-3 px-2">
                  <p className="text-sm text-muted-foreground font-medium">Language / Yare</p>
                  <ToggleGroup
                    type="single"
                    value={language}
                    onValueChange={(value: Language) => { if (value) setLanguage(value) }}
                    className="justify-start gap-2"
                  >
                    <ToggleGroupItem value="en" className="flex-1 min-h-[44px] rounded-lg text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                      {t.english}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="ha" className="flex-1 min-h-[44px] rounded-lg text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                      {t.hausa}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              <SheetClose asChild>
                <motion.button
                  className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </motion.button>
              </SheetClose>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors group">
            <motion.div
              whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </motion.div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold hidden sm:block tracking-tight">
              {t.title}
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/facilities">
              {({ isActive }) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="flex items-center gap-2 min-h-[44px] rounded-xl"
                  >
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Hospital className={cn("w-4 h-4 sm:w-5 sm:h-5", isActive && "text-primary")} />
                    </motion.div>
                    <span className="text-sm font-medium">{t.facilities}</span>
                  </Button>
                </motion.div>
              )}
            </NavLink>
            <ToggleGroup
              type="single"
              value={language}
              onValueChange={(value: Language) => { if (value) setLanguage(value) }}
              className="ml-2"
            >
              <ToggleGroupItem
                value="en"
                className="px-3 min-h-[36px] text-xs sm:text-sm rounded-lg font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {t.english}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="ha"
                className="px-3 min-h-[36px] text-xs sm:text-sm rounded-lg font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {t.hausa}
              </ToggleGroupItem>
            </ToggleGroup>
          </nav>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="default"
              size="sm"
              onClick={() => userRole ? handleLogout() : setLoginModalOpen(true)}
              className="flex items-center gap-2 min-h-[44px] min-w-[44px] rounded-xl shadow-sm"
            >
              {userRole ? (
                <>
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline text-sm font-medium">{t.logout}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline text-sm font-medium">{t.login}</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};