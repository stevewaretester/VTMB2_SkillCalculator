-- Clan Trainers — world positions extracted from LV_Hub WP cells
-- All coordinates are RelativeLocation from child SceneComponent (UE world units)
-- hidden=true instances are story-state alternates (not the default visible placement)
-- Sources: BP_Niko_C, BP_Onda_C, BP_Patience_C, BP_Fletcher_C, BP_MrsThorn_C, BP_Silky_C

local trainers = {

    -- =========================================================================
    -- NIKO — Banu Haqim
    -- Aurora Pawn area / Elysium cluster
    -- =========================================================================
    {
        name   = "Niko",
        clan   = "Banu Haqim",
        actor  = "BP_Niko_C",
        label  = "BP_Niko",
        x      = 180.28859,
        y      = -6.333492,
        z      = -102.62569,
        yaw    = 89.31741,
        hidden = false,
    },

    -- =========================================================================
    -- ONDA — Lasombra
    -- Elysium cluster — multiple story-state versions
    -- =========================================================================
    {
        name   = "Onda",
        clan   = "Lasombra",
        actor  = "BP_Onda_C",
        label  = "BP_Onda2",
        x      = 164.8911,
        y      = -7.630596,
        z      = -80.84041,
        yaw    = 110.0,
        hidden = false,
        note   = "primary visible state",
    },
    {
        name   = "Onda",
        clan   = "Lasombra",
        actor  = "BP_Onda_C",
        label  = "BP_Onda",
        x      = 4.7688704,
        y      = -19.28893,
        z      = -116.757645,
        yaw    = -175.0,
        hidden = true,
        note   = "hidden — alternate state A",
    },
    {
        name   = "Onda",
        clan   = "Lasombra",
        actor  = "BP_Onda_C",
        label  = "BP_Onda",
        x      = 159.88939,
        y      = 6.042631,
        z      = -82.30671,
        yaw    = 122.7259,
        hidden = true,
        note   = "hidden — alternate state B",
    },
    {
        name   = "Onda",
        clan   = "Lasombra",
        actor  = "BP_Onda_C",
        label  = "BP_OndaFacingFabien",
        x      = 89.03619,
        y      = -8.39537,
        z      = -76.0,
        yaw    = -270.0,
        hidden = true,
        note   = "hidden — Fabien conversation variant",
    },
    {
        name   = "Onda",
        clan   = "Lasombra",
        actor  = "BP_Onda_C",
        label  = "BP_Onda3",
        x      = -9258.526,
        y      = 19512.203,
        z      = 1980.5199,
        yaw    = -249.14386,
        hidden = true,
        note   = "hidden — off-hub placement (St. Stephens mission area)",
    },

    -- =========================================================================
    -- PATIENCE — Toreador
    -- Back of Aurora Pawn / Elysium cluster
    -- =========================================================================
    {
        name   = "Patience",
        clan   = "Toreador",
        actor  = "BP_Patience_C",
        label  = "BP_Patience",
        x      = 173.97935,
        y      = 11.555431,
        z      = -102.75624,
        yaw    = 90.93127,
        hidden = false,
    },
    {
        name   = "Patience",
        clan   = "Toreador",
        actor  = "BP_Patience_C",
        label  = "BP_Patience",
        x      = 89.39644,
        y      = -34.71608,
        z      = -66.0,
        yaw    = 60.0,
        hidden = true,
        note   = "hidden — alternate state A",
    },
    {
        name   = "Patience",
        clan   = "Toreador",
        actor  = "BP_Patience_C",
        label  = "BP_Patience2",
        x      = -61.60913,
        y      = 205.4923,
        z      = -133.49039,
        yaw    = -150.0,
        hidden = true,
        note   = "hidden — alternate state B",
    },

    -- =========================================================================
    -- FLETCHER — Ventrue
    -- Makom Bar owner / Elysium cluster
    -- =========================================================================
    {
        name   = "Fletcher",
        clan   = "Ventrue",
        actor  = "BP_Fletcher_C",
        label  = "BP_Fletcher",
        x      = 122.47982,
        y      = 48.43241,
        z      = -109.567955,
        yaw    = 62.418713,
        hidden = false,
    },

    -- =========================================================================
    -- MRS THORNE — Tremere
    -- Wake the Dead Cafe (separate sublevel)
    -- =========================================================================
    {
        name   = "Mrs Thorne",
        clan   = "Tremere",
        actor  = "BP_MrsThorn_C",
        label  = "BP_Shopkeeper_ClanTremere",
        x      = -3.214573,
        y      = 9.879009,
        z      = -86.0,
        yaw    = 180.0,
        hidden = false,
        note   = "primary visible state",
    },
    {
        name   = "Mrs Thorne",
        clan   = "Tremere",
        actor  = "BP_MrsThorn_C",
        label  = "BP_Shopkeeper",
        x      = -205.1698,
        y      = -303.54843,
        z      = -228.24602,
        yaw    = -85.0,
        hidden = true,
        note   = "hidden — alternate state",
    },

    -- =========================================================================
    -- SILKY — Brujah
    -- The Dutchman Bar (separate sublevel)
    -- =========================================================================
    {
        name   = "Silky",
        clan   = "Brujah",
        actor  = "BP_Silky_C",
        label  = "BP_Dutch_ClanBrujah",
        x      = 160.42,
        y      = -57.66192,
        z      = -118.36777,
        yaw    = 105.0,
        hidden = false,
    },

}

return trainers
