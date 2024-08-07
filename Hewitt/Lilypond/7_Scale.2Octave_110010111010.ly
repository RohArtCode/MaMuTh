\version "2.18.2" \score { \new Staff << \new Voice { \set midiInstrument = #"piano" \voiceOne
 \key c \major \time 15/4
\override Voice.TextScript.font-size = #-4
 { c'' des'' e'' fis'' g'' aes'' bes'' c''' des''' e''' fis''' g''' aes''' bes''' c''''  } 
 } >> \layout { } \midi { \context { \Staff \remove "Staff_performer" }
\context { \Voice \consists "Staff_performer" } \tempo 2 = 60 } }
\paper{oddHeaderMarkup = ##f oddFooterMarkup = ##f}
