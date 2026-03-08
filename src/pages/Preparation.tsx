import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PreparationModule } from "@/components/PreparationModule";

export default function Preparation() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            Preparation Resources
          </h1>
          <p className="text-muted-foreground mt-1">Master interview concepts with curated courses and lessons.</p>
        </motion.div>

        <PreparationModule />
      </div>
    </div>
  );
}
