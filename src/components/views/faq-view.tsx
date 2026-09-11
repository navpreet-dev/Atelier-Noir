"use client";

import { CircleQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { FAQ_ITEMS } from "@/lib/site-data";

/* Shared strings from the original build. */
const CX = "text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400";
const CF = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

const FAQ_TABS = ["All", "Shipping & Returns", "Product & Fit", "Orders & Payment"];

export function FaqView() {
  const navigate = useStore((s) => s.navigate);

  return (
    <div>
      {/* Intro header */}
      <header className={`${CF} pb-12 pt-14 text-center md:pb-16 md:pt-20`}>
        <p className={`${CX} text-[#B08968]`}>Customer Care</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight tracking-tight text-stone-900 md:text-6xl">
          Frequently asked questions
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-stone-500 md:text-[15px]">
          Everything about delivery, returns, care and repairs — in plain language.
        </p>
      </header>

      <section className={`${CF} pb-20 md:pb-28`}>
        <Tabs defaultValue="All" className="mx-auto max-w-3xl">
          <TabsList className="mx-auto h-auto flex-wrap justify-center rounded-none border border-stone-200 bg-white p-1">
            {FAQ_TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 transition-colors hover:text-stone-900 data-[state=active]:bg-stone-900 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {FAQ_TABS.map((tab) => {
            const items = FAQ_ITEMS.filter((item) => tab === "All" || item.cat === tab);
            return (
              <TabsContent key={tab} value={tab} className="mt-10">
                <Accordion type="single" collapsible className="border-t border-stone-200">
                  {items.map((item) => (
                    <AccordionItem
                      key={item.q}
                      value={item.q}
                      className="border-b border-stone-200 last:border-b"
                    >
                      <AccordionTrigger className="py-5 text-left text-base font-medium text-stone-900 hover:no-underline md:text-[17px]">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-[15px] leading-relaxed text-stone-600">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Still need help */}
        <div className="mx-auto mt-16 max-w-3xl border border-stone-200 bg-stone-50 p-8 text-center md:p-12">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white">
            <CircleQuestionMark size={20} strokeWidth={1.5} aria-hidden />
          </span>
          <h2 className="mt-5 font-display text-2xl tracking-tight text-stone-900 md:text-3xl">
            Still need help?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
            Our customer care team replies within one business day — or visit us at the Paris
            flagship for fit advice in person.
          </p>
          <Button
            className="mt-8 h-12 rounded-none bg-stone-900 px-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-stone-700"
            onClick={() => navigate({ name: "contact" })}
          >
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
}
