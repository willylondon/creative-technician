import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { siteAuthor } from "@/lib/author";

export default function AuthorCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-6 sm:gap-5 sm:p-8">
      <Avatar className="h-16 w-16 border border-white/10 bg-black/20 ring-1 ring-white/5 sm:h-[72px] sm:w-[72px]">
        <AvatarImage
          src={siteAuthor.avatar.src}
          alt={siteAuthor.avatar.alt}
          className="object-cover"
        />
        <AvatarFallback className="bg-gradient-to-br from-cyan-300 to-amber-300 text-sm font-semibold text-black">
          {siteAuthor.avatar.fallback}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h3 className="text-lg font-bold">{siteAuthor.name}</h3>
        <p className="text-sm text-slate-400">{siteAuthor.role}</p>
      </div>
    </div>
  );
}
