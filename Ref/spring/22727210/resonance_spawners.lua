-- Resonance bag spawn locations extracted from LV_Hub WP cells
-- These are static/scripted bags, not the random crowd resonance system
-- size: "Medium" or "Large" affects resonance yield

local resonance_spawners = {

    {
        resonance = "Sanguine",
        size      = "Medium",
        label     = "BP_BloodResonanceBag_Sanguine_Medium",
        venue     = "Wake the Dead Cafe",
        x         = -7691.092,
        y         = 37422.043,
        z         = 1765.336,
    },
    {
        resonance = "Melancholic",
        size      = "Medium",
        label     = "BP_BloodResonanceBag_Melancholic_Medium_Haven",
        x         = -21173.566,
        y         = 24877.738,
        z         = 2437.016,
    },
    {
        resonance = "Choleric",
        size      = "Medium",
        label     = "BP_BloodResonanceBag_Choleric_Medium",
        venue     = "Dutchman Bar",
        x         = -21647.049,
        y         = 53308.586,
        z         = 903.104,
    },
    {
        resonance = "Melancholic",
        size      = "Medium",
        label     = "BP_BloodResonanceBag_Melancholic_Medium",
        x         = -11789.434,
        y         = -16134.58,
        z         = 8020.086,
    },

}

return resonance_spawners
