using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Foot2site_V1.Data;
using Foot2site_V1.Modele;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;

namespace Foot2site_V1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaillesController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public TaillesController(Foot2site_V1Context context)
        {
            _context = context;
        }

        // GET: api/Tailles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Taille>>> GetTaille()
        { 

            try{

                var taille = await _context.Taille.ToListAsync();

                return Ok(taille);

            }catch(Exception ex){
                    {
                        return StatusCode(500, new
                        {
                            message = "Erreur lors de la récupération des tailles",
                            details = ex.Message
                        });
                    }
                }
         
        }

        // GET: api/Tailles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Taille>> GetTaille(int id)
        {

            try
            {
                if (id <= 0)
                {
                    return BadRequest(new
                    {
                        message = "L'ID doit être un nombre positif"
                    });
                }

                var taille = await _context.Taille.FindAsync(id);

                if (taille == null)
                {
                    return NotFound(new {message = $"La taille avec l'ID {id} n'existe pas" 
                    });
                }

                return Ok(taille);
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

        // PUT: api/Tailles/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTaille(int id, Taille taille)
        {

            try
            {
                if (id <= 0)
                {
                    return BadRequest(new
                    {
                        message = "L'ID doit être un nombre positif"
                    });
                }

                if (id != taille.Id)
                {
                    return BadRequest(new {message = "L'ID dans l'URL ne correspond pas à l'ID du produit" 
                    });
                }

                // Validation des données
                // Vérifier que la taille existe
                if (!TailleExists(id))
                {
                    return NotFound(new
                    {
                        message = $"La taille avec l'ID {id} n'existe pas"
                    });
                }

                if (string.IsNullOrWhiteSpace(taille.taille))
                {
                    return BadRequest(new { message = "La taille est requise" });
                }

                _context.Entry(taille).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TailleExists(id))
                {
                    return NotFound(new { message = $"La taille avec l'ID {id} n'existe pas" });
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
                    message = "Erreur lors de la récupération de la taille",
                    details = ex.Message
                });

            }
        }

        // POST: api/Tailles
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Taille>> PostTaille(Taille taille)
        {
            try
            {
                // Validation des données
                if (string.IsNullOrWhiteSpace(taille.taille))
                {
                    return BadRequest(new { message = "La taille est requise" });
                }

                // Vérifier si une taille avec la même taille existe déjà
                var tailleExistant = await _context.Taille
                    .FirstOrDefaultAsync(t => t.taille == taille.taille);

                if (tailleExistant != null)
                {
                    return Conflict(new
                    {
                        message = "Cette taille existe déjà",
                        tailleExistanteId = tailleExistant.Id
                    });
                }

                _context.Taille.Add(taille);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    "GetTaille",
                    new { id = taille.Id },
                    taille
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
                    message = "Erreur lors de la création de la taille",
                    details = ex.Message
                });
            }
        }

        // DELETE: api/Tailles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaille(int id)
        {
            try
            {

                // Validation de l'ID
                if (id <= 0)
                {
                    return BadRequest(new { 
                        message = "L'ID doit être un nombre positif" 
                    });
                }

                var taille = await _context.Taille
                    .Include(t => t.Stock_Produits_List)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (taille == null)
                {
                    return NotFound(new { 
                        message = $"La taille avec l'ID {id} n'existe pas" 
                    });
                }
                // Vérifier s'il y a des stocks associés
                if (taille.Stock_Produits_List != null && taille.Stock_Produits_List.Any())
                {
                    return BadRequest(new
                    {
                        message = "Impossible de supprimer cette taille car elle possède des stocks associés",
                        nombreStocks = taille.Stock_Produits_List.Count
                    });
                }
                _context.Taille.Remove(taille);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"La taille '{taille.taille}' a été supprimé avec succès"
                });
            }
            catch (DbUpdateException ex){
                return StatusCode(500, new
                {
                    message = "Erreur lors de la suppression en base de données",
                    details = ex.InnerException?.Message ?? ex.Message
                });
            }
            catch (Exception ex) {
                return StatusCode(500,new
                {
                    message = "Erreur lors de la création de la taille",
                    details = ex.Message
                });
            }

        }

        private bool TailleExists(int id)
        {
            return _context.Taille.Any(e => e.Id == id);
        }
    }
}
