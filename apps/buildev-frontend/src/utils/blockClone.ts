import { v4 as uuidv4 } from "uuid";
import type { BSBlock } from "@buildersite/sdk";

/**
 * Clona un árbol de bloques asignando nuevos UUID a cada nodo.
 *
 * @param block Raíz a clonar (se serializa; no muta el original).
 * @returns Copia profunda con ids nuevos.
 */
export function cloneBlockWithNewIds(block: BSBlock): BSBlock {
    const newBlock = JSON.parse(JSON.stringify(block)) as BSBlock;
    const walk = (b: BSBlock) => {
        b.id = uuidv4();
        if (b.children) b.children.forEach(walk);
    };
    walk(newBlock);
    return newBlock;
}
