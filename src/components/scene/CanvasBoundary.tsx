import { Component, type ReactNode } from "react";

interface CanvasBoundaryProps {
  children: ReactNode;
  /** Force l'affichage de la solution de repli sans erreur (WebGL absent). */
  disabled?: boolean;
}

interface CanvasBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Garde-fou du canvas 3D : si WebGL échoue ou si la scène plante, on ne laisse
 * pas React démonter l'application (écran noir total) — on affiche un message
 * explicite et le HUD reste utilisable.
 */
export default class CanvasBoundary extends Component<
  CanvasBoundaryProps,
  CanvasBoundaryState
> {
  state: CanvasBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): CanvasBoundaryState {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur de rendu 3D inconnue.";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown): void {
    // Journaliser en console pour le diagnostic, sans faire planter l'app.
    console.error("[CanvasBoundary] La scène 3D a échoué :", error);
  }

  render(): ReactNode {
    if (!this.state.hasError && !this.props.disabled) {
      return this.props.children;
    }

    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-3 bg-factory-bg/60 p-8 text-center text-white">
        <span className="text-3xl" aria-hidden="true">
          🏭
        </span>
        <h2 className="text-lg font-semibold">Vue 3D indisponible</h2>
        <p className="max-w-md text-sm text-neutral-300">
          Le rendu 3D ne peut pas être affiché (WebGL désactivé ou non pris en
          charge par votre navigateur). Le tableau de bord reste accessible via
          le panneau « Ateliers ».
        </p>
        {this.state.message && (
          <p className="max-w-md break-all text-xs text-neutral-500">
            Détail technique : {this.state.message}
          </p>
        )}
      </div>
    );
  }
}