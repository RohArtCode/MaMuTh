\version "2.18.2" \score { \new Staff << \new Voice { \set midiInstrument = #"piano" \voiceOne
 \key c \major \time 15/4
\override Voice.TextScript.font-size = #-4
 { c'' d'' ees'' e'' aes'' a'' b'' c''' d''' ees''' e''' aes''' a''' b''' c''''  } 
 } >> \layout { } \midi { \context { \Staff \remove "Staff_performer" }
\context { \Voice \consists "Staff_performer" } \tempo 2 = 60 } }
\paper{oddHeaderMarkup = ##f oddFooterMarkup = ##f}