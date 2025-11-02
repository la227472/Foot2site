using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Foot2site_V1.Data;
using Foot2site_V1.Modele;

namespace Foot2site_V1.Controllers
{
    /// <summary>
    /// Controlleur pour gérer les opérations CRUD sur les stocks de produits.
    /// Voici les Endpoints : 
    /// GET   /api/Stock_produit               -> Récupérer tous les stocks de produits
    /// GET   /api/Stock_produit/{id}          -> Récupérer un stock de produit par ID
    /// GET   /api/Stock_produit/produit/{produitId} -> Récupérer tous les stocks pour un produit spécifique
    /// PUT   /api/Stock_produit/{id}          -> Mettre à jour un stock de produit existant
    /// POST  /api/Stock_produit               -> Créer un nouveau stock de produit
    /// DELETE /api/Stock_produit/{id}          -> Supprimer un stock de produit par ID
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class Stock_produitController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public Stock_produitController(Foot2site_V1Context context)
        {
            _context = context;
        }

        /// <summary>
        /// Permet de récupérer la liste de tous les stocks de produits.
        /// </summary>
        /// <returns></returns>
        // GET: api/Stock_produit
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Stock_produit>>> GetStock_produit()
        {
            try
            {
                var stocks = await _context.Stock_produit
                    .Include(s => s.produit)
                    .Include(s => s.taille)
                    .ToListAsync();

                return Ok(stocks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la récupération des stocks",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Permet de récupérer un stock de produit par son ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // GET: api/Stock_produit/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Stock_produit>> GetStock_produit(int id)
        {
            try
            {
                // Validation de l'ID
                if (id <= 0)
                {
                    return BadRequest(new { message = "L'ID doit être un nombre positif" });
                }

                var stock_produit = await _context.Stock_produit
                    .Include(s => s.produit)
                    .Include(s => s.taille)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (stock_produit == null)
                {
                    return NotFound(new { message = $"Le stock avec l'ID {id} n'existe pas" });
                }

                return Ok(stock_produit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la récupération du stock",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Permet de récupérer tous les stocks pour un produit spécifique.
        /// </summary>
        /// <param name="produitId"></param>
        /// <returns></returns>
        // GET: api/Stock_produit/produit/5
        [HttpGet("produit/{produitId}")]
        public async Task<ActionResult<IEnumerable<Stock_produit>>> GetStocksByProduit(int produitId)
        {
            try
            {
                // Validation de l'ID
                if (produitId <= 0)
                {
                    return BadRequest(new { message = "L'ID du produit doit être un nombre positif" });
                }

                // Vérifier que le produit existe
                var produitExiste = await _context.Produit.AnyAsync(p => p.Id == produitId);
                if (!produitExiste)
                {
                    return NotFound(new { message = $"Le produit avec l'ID {produitId} n'existe pas" });
                }

                var stocks = await _context.Stock_produit
                    .Include(s => s.taille)
                    .Where(s => s.id_PRODUIT == produitId)
                    .ToListAsync();

                return Ok(stocks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la récupération des stocks du produit",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Permet de mettre à jour un stock de produit existant.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="stock_produit"></param>
        /// <returns></returns>
        // PUT: api/Stock_produit/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStock_produit(int id, Stock_produit stock_produit)
        {
            try
            {
                // Validation de l'ID
                if (id <= 0)
                {
                    return BadRequest(new { message = "L'ID doit être un nombre positif" });
                }

                if (id != stock_produit.Id)
                {
                    return BadRequest(new
                    {
                        message = "L'ID dans l'URL ne correspond pas à l'ID du stock"
                    });
                }

                // Vérifier que le stock existe
                if (!Stock_produitExists(id))
                {
                    return NotFound(new { message = $"Le stock avec l'ID {id} n'existe pas" });
                }

                // Validation des données
                if (stock_produit.quantite < 0)
                {
                    return BadRequest(new { message = "La quantité ne peut pas être négative" });
                }

                if (stock_produit.id_PRODUIT <= 0)
                {
                    return BadRequest(new { message = "L'ID du produit est requis" });
                }

                if (stock_produit.id_TAILLE <= 0)
                {
                    return BadRequest(new { message = "L'ID de la taille est requis" });
                }

                // Vérifier que le produit existe
                var produitExiste = await _context.Produit.AnyAsync(p => p.Id == stock_produit.id_PRODUIT);
                if (!produitExiste)
                {
                    return BadRequest(new
                    {
                        message = $"Le produit avec l'ID {stock_produit.id_PRODUIT} n'existe pas"
                    });
                }

                // Vérifier que la taille existe
                var tailleExiste = await _context.Taille.AnyAsync(t => t.Id == stock_produit.id_TAILLE);
                if (!tailleExiste)
                {
                    return BadRequest(new
                    {
                        message = $"La taille avec l'ID {stock_produit.id_TAILLE} n'existe pas"
                    });
                }

                // Vérifier qu'il n'y a pas déjà un stock pour ce produit/taille (sauf le stock actuel)
                var stockDuplique = await _context.Stock_produit
                    .AnyAsync(s => s.id_PRODUIT == stock_produit.id_PRODUIT &&
                                   s.id_TAILLE == stock_produit.id_TAILLE &&
                                   s.Id != id);

                if (stockDuplique)
                {
                    return Conflict(new
                    {
                        message = "Un stock existe déjà pour ce produit et cette taille"
                    });
                }

                _context.Entry(stock_produit).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Stock_produitExists(id))
                {
                    return NotFound(new { message = $"Le stock avec l'ID {id} n'existe pas" });
                }
                else
                {
                    return StatusCode(500, new
                    {
                        message = "Erreur de concurrence lors de la mise à jour"
                    });
                }
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la mise à jour en base de données",
                    details = ex.InnerException?.Message ?? ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la mise à jour du stock",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Permet de créer un nouveau stock de produit.
        /// </summary>
        /// <param name="stock_produit"></param>
        /// <returns></returns>
        // POST: api/Stock_produit
        [HttpPost]
        public async Task<ActionResult<Stock_produit>> PostStock_produit(Stock_produit stock_produit)
        {
            try
            {
                // Validation des données
                if (stock_produit.quantite < 0)
                {
                    return BadRequest(new { message = "La quantité ne peut pas être négative" });
                }

                if (stock_produit.id_PRODUIT <= 0)
                {
                    return BadRequest(new { message = "L'ID du produit est requis" });
                }

                if (stock_produit.id_TAILLE <= 0)
                {
                    return BadRequest(new { message = "L'ID de la taille est requis" });
                }

                // Vérifier que le produit existe
                var produitExiste = await _context.Produit.AnyAsync(p => p.Id == stock_produit.id_PRODUIT);
                if (!produitExiste)
                {
                    return BadRequest(new
                    {
                        message = $"Le produit avec l'ID {stock_produit.id_PRODUIT} n'existe pas"
                    });
                }

                // Vérifier que la taille existe
                var tailleExiste = await _context.Taille.AnyAsync(t => t.Id == stock_produit.id_TAILLE);
                if (!tailleExiste)
                {
                    return BadRequest(new
                    {
                        message = $"La taille avec l'ID {stock_produit.id_TAILLE} n'existe pas"
                    });
                }

                // Vérifier qu'il n'y a pas déjà un stock pour ce produit/taille
                var stockExistant = await _context.Stock_produit
                    .FirstOrDefaultAsync(s => s.id_PRODUIT == stock_produit.id_PRODUIT &&
                                              s.id_TAILLE == stock_produit.id_TAILLE);

                if (stockExistant != null)
                {
                    return Conflict(new
                    {
                        message = "Un stock existe déjà pour ce produit et cette taille",
                        stockExistantId = stockExistant.Id,
                        quantiteActuelle = stockExistant.quantite,
                        conseil = "Utilisez PUT pour mettre à jour la quantité existante"
                    });
                }

                _context.Stock_produit.Add(stock_produit);
                await _context.SaveChangesAsync();

                // Recharger avec les relations pour la réponse
                var stockCree = await _context.Stock_produit
                    .Include(s => s.produit)
                    .Include(s => s.taille)
                    .FirstOrDefaultAsync(s => s.Id == stock_produit.Id);

                return CreatedAtAction("GetStock_produit", new { id = stock_produit.Id }, stockCree);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de l'ajout en base de données",
                    details = ex.InnerException?.Message ?? ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la création du stock",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Permet de supprimer un stock de produit par son ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // DELETE: api/Stock_produit/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStock_produit(int id)
        {
            try
            {
                // Validation de l'ID
                if (id <= 0)
                {
                    return BadRequest(new { message = "L'ID doit être un nombre positif" });
                }

                // Charger avec les lignes de commande pour vérifier les dépendances
                var stock_produit = await _context.Stock_produit
                    .Include(s => s.lignesCommande)
                    .Include(s => s.produit)
                    .Include(s => s.taille)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (stock_produit == null)
                {
                    return NotFound(new { message = $"Le stock avec l'ID {id} n'existe pas" });
                }

                // Vérifier s'il y a des lignes de commande associées
                if (stock_produit.lignesCommande != null && stock_produit.lignesCommande.Any())
                {
                    return BadRequest(new
                    {
                        message = "Impossible de supprimer ce stock car il est référencé dans des commandes",
                        nombreCommandes = stock_produit.lignesCommande.Count
                    });
                }

                _context.Stock_produit.Remove(stock_produit);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Le stock du produit '{stock_produit.produit?.nom_produit}' (taille {stock_produit.taille?.taille}) a été supprimé avec succès"
                });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la suppression en base de données",
                    details = ex.InnerException?.Message ?? ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la suppression du stock",
                    details = ex.Message
                });
            }
        }

        private bool Stock_produitExists(int id)
        {
            return _context.Stock_produit.Any(e => e.Id == id);
        }

    }
}
