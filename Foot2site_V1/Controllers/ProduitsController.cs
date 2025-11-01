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
    [Route("api/[controller]")]
    [ApiController]
    public class ProduitsController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public ProduitsController(Foot2site_V1Context context)
        {
            _context = context;
        }

        // GET: api/Produits
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Produit>>> GetProduit()
        {
            try
            {
                var produits = await _context.Produit
               .Include(p => p.stocks)
               .ThenInclude(s => s.taille)
               .ToListAsync();

                return Ok(produits);
            }
            catch (Exception ex)
            {
                {
                    return StatusCode(500, new
                    {
                        message = "Erreur lors de la récupération des produits",
                        details = ex.Message
                    });
                }
            }
           
        }

        // GET: api/Produits/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Produit>> GetProduit(int id)
        {
            try
            {
                // Validation de l'ID
                if (id <= 0)
                {
                    return BadRequest(new 
                    { message = "L'ID doit être un nombre positif" 
                    });
                }

                var produit = await _context.Produit
                    .Include(p => p.stocks)
                    .ThenInclude(s => s.taille)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (produit == null)
                {
                    return NotFound(new { message = $"Le produit avec l'ID {id} n'existe pas" });
                }

                return Ok(produit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la récupération du produit",
                    details = ex.Message
                });
            }
        }

        // PUT: api/Produits/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduit(int id, Produit produit)
        {
            try
            {
                // Validation de l'ID
                if (id <= 0)
                {
                    return BadRequest(new { message = "L'ID doit être un nombre positif" });
                }

                if (id != produit.Id)
                {
                    return BadRequest(new
                    {
                        message = "L'ID dans l'URL ne correspond pas à l'ID du produit"
                    });
                }

                // Vérifier que le produit existe
                if (!ProduitExists(id))
                {
                    return NotFound(new { message = $"Le produit avec l'ID {id} n'existe pas" });
                }

                // Validation des données
                if (string.IsNullOrWhiteSpace(produit.nom_produit))
                {
                    return BadRequest(new { message = "Le nom du produit est requis" });
                }

                if (string.IsNullOrWhiteSpace(produit.description_produit))
                {
                    return BadRequest(new { message = "La description du produit est requise" });
                }

                if (produit.prix_unitaire_produit <= 0)
                {
                    return BadRequest(new { message = "Le prix doit être supérieur à 0" });
                }

                _context.Entry(produit).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProduitExists(id))
                {
                    return NotFound(new { message = $"Le produit avec l'ID {id} n'existe pas" });
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
                    message = "Erreur lors de la mise à jour du produit",
                    details = ex.Message
                });
            }
        }

        // POST: api/Produits
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Produit>> PostProduit(Produit produit)
        {
            try
            {
                // Validation des données
                if (string.IsNullOrWhiteSpace(produit.nom_produit))
                {
                    return BadRequest(new { message = "Le nom du produit est requis" });
                }

                if (string.IsNullOrWhiteSpace(produit.description_produit))
                {
                    return BadRequest(new { message = "La description du produit est requise" });
                }

                if (produit.prix_unitaire_produit <= 0)
                {
                    return BadRequest(new { message = "Le prix doit être supérieur à 0" });
                }

                // Vérifier si un produit avec le même nom existe déjà
                var produitExistant = await _context.Produit
                    .FirstOrDefaultAsync(p => p.nom_produit == produit.nom_produit);

                if (produitExistant != null)
                {
                    return Conflict(new
                    {
                        message = "Un produit avec ce nom existe déjà",
                        produitExistantId = produitExistant.Id
                    });
                }

                // Si des stocks sont fournis, valider les tailles
                if (produit.stocks != null && produit.stocks.Any())
                {
                    foreach (var stock in produit.stocks)
                    {
                        if (stock.quantite < 0)
                        {
                            return BadRequest(new
                            {
                                message = "La quantité en stock ne peut pas être négative"
                            });
                        }

                        var tailleExiste = await _context.Taille
                            .AnyAsync(t => t.Id == stock.id_TAILLE);

                        if (!tailleExiste)
                        {
                            return BadRequest(new
                            {
                                message = $"La taille avec l'ID {stock.id_TAILLE} n'existe pas"
                            });
                        }
                    }
                }

                _context.Produit.Add(produit);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    "GetProduit",
                    new { id = produit.Id },
                    produit
                );
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
                    message = "Erreur lors de la création du produit",
                    details = ex.Message
                });
            }
        }

        // DELETE: api/Produits/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduit(int id)
        {
            try
            {
                // Validation de l'ID
                if (id <= 0)
                {
                    return BadRequest(new { message = "L'ID doit être un nombre positif" });
                }

                var produit = await _context.Produit
                    .Include(p => p.stocks)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (produit == null)
                {
                    return NotFound(new { message = $"Le produit avec l'ID {id} n'existe pas" });
                }

                // Vérifier s'il y a des stocks associés
                if (produit.stocks != null && produit.stocks.Any())
                {
                    return BadRequest(new
                    {
                        message = "Impossible de supprimer ce produit car il possède des stocks associés",
                        nombreStocks = produit.stocks.Count
                    });
                }

                _context.Produit.Remove(produit);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Le produit '{produit.nom_produit}' a été supprimé avec succès"
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
                    message = "Erreur lors de la suppression du produit",
                    details = ex.Message
                });
            }
        }

        private bool ProduitExists(int id)
        {
            return _context.Produit.Any(e => e.Id == id);
        }
    }
}
