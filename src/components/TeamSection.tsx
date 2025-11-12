import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ✅ import images from /src/assets
import baderImg from "@/assets/bader2.png";
import helalImg from "@/assets/helal4.png";

interface Member {
  id: string;
  name: { he: string; en: string };
  title: { he: string; en: string };
  desc: { he: string; en: string };
  image: string;         // string is fine; Vite gives a URL
  skills: string[];
  bio: { he: string; en: string };
}

const team: Member[] = [
 
  {
    id: "2",
    name: { he: "הלאל", en: "Helal" },
    title: { he: "מהנדס תוכנה ומפתח פולסטאק", en: "Full Stack Developer" },
    desc: {
      he: "מומחה בפיתוח מערכות מבוססות Node.js ו-React עם ניסיון של מעל 5 שנים במערכות חכמות.",
      en: "Expert in full-stack systems with Node.js and React, 5+ years of experience in scalable web apps.",
    },
    image: helalImg, // ✅ bundled path
    skills: ["React", "MongoDB", "Python", "Express", "Firebase"],
    bio: {
      he: "הלל מתמקד בארכיטקטורה, צד שרת ואינטגרציה עם מערכות חכמות בזמן אמת.",
      en: "Helal focuses on architecture, backend engineering, and real-time smart integrations.",
    },
  },
   {
    id: "1",
    name: { he: "בדר", en: "Bader" },
    title: { he: "מהנדס תוכנה", en: "Software Engineer" },
    desc: {
      he: "מתמחה בעיצוב ופיתוח ממשקי משתמש מתקדמים ואינטראקטיביים עם ניסיון של מעל 3 שנים בתחום.",
      en: "Specializes in UI/UX engineering and interactive front-end systems with 3+ years of experience.",
    },
    image: baderImg, // ✅ bundled path
    skills: ["Next.js", "Node.js", "Java", "Tailwind", "MySQL"],
    bio: {
      he: "בדר מוביל את פיתוח צד הלקוח בחברת Luxury Tech עם דגש על ביצועים, חוויית משתמש ועיצוב נקי.",
      en: "Bader leads front-end development at Luxury Tech, focusing on performance, UX, and clean design.",
    },
  },
];

export const TeamSection = () => {
  const { language } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  return (
    <section id="team" className="py-24 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16">
          <span className="text-gradient-gold">
            {language === "he" ? "הצוות שלנו" : "Our Team"}
          </span>
        </h2>

        {/* Centered Grid */}
        <div className="flex flex-wrap justify-center gap-8">
          {team.map((member) => (
            <Card
              key={member.id}
              className="w-[300px] group cursor-pointer rounded-xl overflow-hidden bg-card border border-border hover-lift hover-glow"
              onClick={() => setSelectedMember(member)}
            >
              {/* Image */}
              <div className="relative overflow-hidden mx-auto mt-6 w-36 h-36 rounded-full ring-1 ring-border">
                <img
                  src={member.image}
                  alt={member.name[language]}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-full"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Text */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-1 text-foreground">
                  {member.name[language]}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {member.title[language]}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {member.desc[language]}
                </p>

                <Separator className="my-4" />

                {/* Skill Badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {member.skills.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="text-xs font-semibold border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Member Dialog */}
        <Dialog
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)} // close only
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            {selectedMember && (
              <div className="bg-card">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name[language]}
                  className="w-full h-60 object-cover"
                  loading="eager"
                  decoding="async"
                />
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    {selectedMember.name[language]}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedMember.title[language]}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {selectedMember.bio[language]}
                  </p>

                    <Separator className="my-4" />
                    <div className="flex flex-wrap justify-center gap-2">
                      {selectedMember.skills.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-xs font-semibold border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
